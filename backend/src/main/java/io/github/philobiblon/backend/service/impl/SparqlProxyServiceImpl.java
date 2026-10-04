package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.service.SparqlProxyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class SparqlProxyServiceImpl implements SparqlProxyService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlProxyServiceImpl.class);

    private static final String USER_AGENT = "PhiloBiblon-UI/1.0 (+https://philobiblon.cog.berkeley.edu)";
    private static final String REPUTATION_CHALLENGE_PATH = "rep-pow-challenge";
    private static final int LOG_BODY_SNIPPET_LENGTH = 300;

    private final String sparqlEndpoint;
    private final long maxResponseBytes;
    private final Duration requestTimeout;
    // Redirects are not followed (HttpClient default): a reputation challenge must surface as an error.
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public SparqlProxyServiceImpl(@Value("${sparql.endpoint}") String sparqlEndpoint,
                                  @Value("${sparql.proxy.maxResponseBytes:10485760}") long maxResponseBytes,
                                  // Keep it below the nginx proxy_read_timeout (60 s by default) so that the
                                  // backend answers a readable 502 before a proxy answers a bare 504.
                                  @Value("${sparql.proxy.timeoutSeconds:45}") long timeoutSeconds) {
        this.sparqlEndpoint = sparqlEndpoint;
        this.maxResponseBytes = maxResponseBytes;
        this.requestTimeout = Duration.ofSeconds(timeoutSeconds);
    }

    @Override
    public String query(String sparqlQuery) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(sparqlEndpoint))
                .timeout(requestTimeout)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/sparql-results+json")
                .header("User-Agent", USER_AGENT)
                .POST(HttpRequest.BodyPublishers.ofString(
                        "query=" + URLEncoder.encode(sparqlQuery, StandardCharsets.UTF_8) + "&format=json"))
                .build();
        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            try (InputStream in = response.body()) {
                int status = response.statusCode();
                if (status / 100 == 2) {
                    return readCapped(in);
                }
                throw upstreamError(response, in);
            }
        } catch (HttpTimeoutException e) {
            logger.warn("SPARQL endpoint did not answer within {}", requestTimeout);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint timed out", e);
        } catch (IOException e) {
            logger.warn("SPARQL endpoint unreachable: {}", e.toString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint unreachable", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL request interrupted", e);
        }
    }

    private String readCapped(InputStream in) throws IOException {
        byte[] bytes = in.readNBytes((int) Math.min(maxResponseBytes + 1, Integer.MAX_VALUE));
        if (bytes.length > maxResponseBytes) {
            logger.warn("SPARQL response exceeds {} bytes", maxResponseBytes);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL response too large");
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }

    /** 4xx are the caller's fault (e.g. malformed query) and pass through; anything else is a gateway error. */
    private ResponseStatusException upstreamError(HttpResponse<InputStream> response, InputStream in)
            throws IOException {
        int status = response.statusCode();
        String location = response.headers().firstValue("Location").orElse("");
        String snippet = new String(in.readNBytes(LOG_BODY_SNIPPET_LENGTH), StandardCharsets.UTF_8);
        if (location.contains(REPUTATION_CHALLENGE_PATH)) {
            logger.warn("SPARQL endpoint answered {} with a reputation challenge ({})", status, location);
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint reputation challenge");
        }
        logger.warn("SPARQL endpoint answered {}: {}", status, snippet);
        if (status / 100 == 4) {
            return new ResponseStatusException(HttpStatusCode.valueOf(status), snippet);
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint answered " + status);
    }
}
