package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SparqlController;
import io.github.philobiblon.backend.service.SparqlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class SparqlControllerImpl implements SparqlController {

    private SparqlService sparqlService;

    @Autowired
    public SparqlControllerImpl(SparqlService sparqlService) {
        this.sparqlService = sparqlService;
    }

    public ResponseEntity<String> runSparql(String format, String query) {
        String result = sparqlService.executeSparqlQuery(query);
        return ResponseEntity.ok(result);
    }
}

