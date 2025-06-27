package io.github.philobiblon.backend.service;

import org.apache.jena.query.ResultSetRewindable;

public interface SparqlService {

    ResultSetRewindable getSparqlQueryResult(String sparqlQuery);

    ResultSetRewindable executeSparqlQuery(String sparqlQuery);
}
