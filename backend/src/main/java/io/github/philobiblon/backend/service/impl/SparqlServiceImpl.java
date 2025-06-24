package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.service.SparqlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class SparqlServiceImpl implements SparqlService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlServiceImpl.class);

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable("sparqlCache")
    public String executeSparqlQuery(String sparqlQuery) {
        logger.info("Executing sparqlQuery {}...", sparqlQuery);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.valueOf("application/sparql-results+json")));

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("query", sparqlQuery);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(sparqlEndpoint, request, String.class);

        return response.getBody();
    }
}

