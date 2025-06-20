package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.service.SparqlService;
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

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable("sparqlCache")
    public String executeSparqlQuery(String sparqlQuery) {
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

