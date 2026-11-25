package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.helper.SparqlQueryValidator;
import io.github.philobiblon.backend.helper.UpstreamHttp;
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
import java.util.Set;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@Service
public class SparqlProxyServiceImpl implements SparqlProxyService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlProxyServiceImpl.class);

    private static final int LOG_BODY_SNIPPET_LENGTH = 300;
    private static final Set<Integer> PASS_THROUGH_STATUSES = Set.of(400, 413, 414);

    private final String sparqlEndpoint;
    private final long maxResponseBytes;
    private final Duration requestTimeout;
    private final SparqlQueryValidator queryValidator;
    /** Bounds the concurrent upstream queries; fair so that queued requests are served in arrival order. */
    private final Semaphore upstreamPermits;
    private final long queueTimeoutSeconds;
    // Redirects are not followed (HttpClient default): a reputation challenge must surface as an error.
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public SparqlProxyServiceImpl(@Value("${sparql.endpoint}") String sparqlEndpoint,
                                  @Value("${sparql.proxy.maxResponseBytes:10485760}") long maxResponseBytes,
                                  // Keep it below the nginx proxy_read_timeout (60 s by default) so that the
                                  // backend answers a readable 502 before a proxy answers a bare 504.
                                  @Value("${sparql.proxy.timeoutSeconds:45}") long timeoutSeconds,
                                  @Value("${sparql.proxy.maxConcurrent:16}") int maxConcurrent,
                                  // queueTimeoutSeconds + timeoutSeconds must also stay below proxy_read_timeout.
                                  @Value("${sparql.proxy.queueTimeoutSeconds:10}") long queueTimeoutSeconds,
                                  SparqlQueryValidator queryValidator) {
        this.sparqlEndpoint = sparqlEndpoint;
        this.maxResponseBytes = maxResponseBytes;
        this.requestTimeout = Duration.ofSeconds(timeoutSeconds);
        this.upstreamPermits = new Semaphore(Math.max(1, maxConcurrent), true);
        this.queueTimeoutSeconds = queueTimeoutSeconds;
        this.queryValidator = queryValidator;
    }

    @Override
    public String query(String sparqlQuery) {
        // Validate first: a rejected query never waits in the queue nor reaches the endpoint.
        queryValidator.validate(sparqlQuery);
        long queueStart = System.nanoTime();
        try {
            if (!upstreamPermits.tryAcquire(queueTimeoutSeconds, TimeUnit.SECONDS)) {
                logger.warn("SPARQL proxy busy: no upstream slot freed within {} s", queueTimeoutSeconds);
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SPARQL proxy busy");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL request interrupted", e);
        }
        long queuedMs = elapsedMs(queueStart);
        long upstreamStart = System.nanoTime();
        String outcome = "error";
        try {
            String body = send(sparqlQuery);
            outcome = "200";
            return body;
        } catch (ResponseStatusException e) {
            outcome = e.getReason() != null ? e.getStatusCode().value() + " (" + e.getReason() + ")"
                    : String.valueOf(e.getStatusCode().value());
            throw e;
        } finally {
            upstreamPermits.release();
            logger.info("SPARQL proxy: {} in {} ms (queued {} ms)", outcome, elapsedMs(upstreamStart), queuedMs);
        }
    }

    private static long elapsedMs(long startNanos) {
        return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startNanos);
    }

    private String send(String sparqlQuery) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(sparqlEndpoint))
                .timeout(requestTimeout)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/sparql-results+json")
                .header("User-Agent", UpstreamHttp.USER_AGENT)
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

    /**
     * Only the statuses that blame the query itself pass through; 401/403/429 and the like describe how the
     * endpoint sees this backend, not the caller, so they become a gateway error. The upstream body is only logged.
     */
    private ResponseStatusException upstreamError(HttpResponse<InputStream> response, InputStream in)
            throws IOException {
        int status = response.statusCode();
        String location = response.headers().firstValue("Location").orElse("");
        String snippet = new String(in.readNBytes(LOG_BODY_SNIPPET_LENGTH), StandardCharsets.UTF_8);
        if (location.contains(UpstreamHttp.REPUTATION_CHALLENGE_PATH)) {
            logger.warn("SPARQL endpoint answered {} with a reputation challenge ({})", status, location);
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint reputation challenge");
        }
        logger.warn("SPARQL endpoint answered {}: {}", status, snippet);
        if (PASS_THROUGH_STATUSES.contains(status)) {
            return new ResponseStatusException(HttpStatusCode.valueOf(status), "SPARQL query rejected by the endpoint");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint answered " + status);
    }
}
