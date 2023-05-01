package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.ConfigController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ConfigControllerImpl implements ConfigController {

    @Value("${wikibase.baseUrl}")
    private String wikibaseBaseUrl;
    @Value("${wikibase.apiUrl}")
    private String wikibaseApiUrl;
    @Value("${sparql.baseUrl}")
    private String sparqlBaseUrl;
    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;
    @Value("${sparql.queryPrefix}")
    private String sparqlQueryPrefix;

    @Override
    public Map<String, String> getConfigValues() {
        return Map.of("wikibaseBaseUrl", wikibaseBaseUrl,
                "wikibaseApiUrl", wikibaseApiUrl,
                "sparqlBaseUrl", sparqlBaseUrl,
                "sparqlEndpoint", sparqlEndpoint,
                "sparqlQueryPrefix", sparqlQueryPrefix);
    }
}