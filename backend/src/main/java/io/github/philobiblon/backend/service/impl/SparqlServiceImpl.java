package io.github.philobiblon.backend.service.impl;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.github.philobiblon.backend.service.SparqlService;
import jakarta.annotation.PostConstruct;
import org.apache.jena.query.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class SparqlServiceImpl implements SparqlService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlServiceImpl.class);

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();
    private LoadingCache<String, ResultSetRewindable> sparqlCache;

    @PostConstruct
    public void init() {
        sparqlCache = Caffeine.newBuilder()
                .refreshAfterWrite(24, TimeUnit.HOURS)
                .expireAfterWrite(48, TimeUnit.HOURS)
                .build(this::executeSparqlQuery);
    }

    public ResultSetRewindable executeSparqlQuery(String sparqlQuery) {
        logger.info("Executing sparqlQuery {}...", sparqlQuery);

        Query query = QueryFactory.create(sparqlQuery);

        try (QueryExecution qexec = QueryExecution.service(sparqlEndpoint, query)) {
            ResultSet resultSet = qexec.execSelect();

            ResultSetRewindable rewindable = ResultSetFactory.copyResults(resultSet);

            return rewindable;
        } catch (Exception e) {
            logger.error("Error executing SPARQL query", e);
            throw new RuntimeException("SPARQL query execution failed", e);
        }
    }

    public ResultSetRewindable getSparqlQueryResult(String sparqlQuery) {
        return sparqlCache.get(sparqlQuery);
    }
}

