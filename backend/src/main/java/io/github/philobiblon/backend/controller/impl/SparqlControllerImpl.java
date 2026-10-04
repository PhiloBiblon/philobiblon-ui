package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SparqlController;
import io.github.philobiblon.backend.service.SparqlProxyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SparqlControllerImpl implements SparqlController {

    private final SparqlProxyService sparqlProxyService;

    @Autowired
    public SparqlControllerImpl(SparqlProxyService sparqlProxyService) {
        this.sparqlProxyService = sparqlProxyService;
    }

    @Override
    public String query(String query) {
        return sparqlProxyService.query(query);
    }
}
