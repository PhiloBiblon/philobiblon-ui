package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.service.SparqlProxyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class SparqlProxyServiceImpl implements SparqlProxyService {

    private static final String USER_AGENT = "PhiloBiblon-UI/1.0 (+https://philobiblon.cog.berkeley.edu)";

    private final String sparqlEndpoint;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public SparqlProxyServiceImpl(@Value("${sparql.endpoint}") String sparqlEndpoint) {
        this.sparqlEndpoint = sparqlEndpoint;
    }

    @Override
    public String query(String sparqlQuery) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(sparqlEndpoint))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/sparql-results+json")
                .header("User-Agent", USER_AGENT)
                .POST(HttpRequest.BodyPublishers.ofString(
                        "query=" + URLEncoder.encode(sparqlQuery, StandardCharsets.UTF_8) + "&format=json"))
                .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "SPARQL endpoint answered " + response.statusCode());
            }
            return response.body();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL endpoint unreachable", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SPARQL request interrupted", e);
        }
    }
}
