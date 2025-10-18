package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SparqlController;
import io.github.philobiblon.backend.representation.CacheInfo;
import io.github.philobiblon.backend.service.SparqlService;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SparqlControllerImpl implements SparqlController {

    private SparqlService sparqlService;

    @Autowired
    public SparqlControllerImpl(SparqlService sparqlService) {
        this.sparqlService = sparqlService;
    }

    @Override
    public ResponseEntity<String> runSparql(String format, String query) throws IOException {
        ResultSet resultSet = sparqlService.getSparqlQueryResult(query);
        return ResponseEntity.ok(ResultSetFormatter.asText(resultSet));
    }

    @Override
    public ResponseEntity<CacheInfo> cacheInfo() {
        return ResponseEntity.ok(sparqlService.getCacheInfo());
    }
}

