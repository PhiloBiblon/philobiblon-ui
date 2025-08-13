package io.github.philobiblon.backend.service;

import org.apache.jena.query.ResultSet;

import java.io.IOException;

public interface SparqlService {

    ResultSet getSparqlQueryResult(String sparqlQuery) throws IOException;

}
