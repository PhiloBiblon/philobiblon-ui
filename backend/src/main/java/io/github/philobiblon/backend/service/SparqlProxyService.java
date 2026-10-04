package io.github.philobiblon.backend.service;

public interface SparqlProxyService {

    /** Runs the query against the SPARQL endpoint and returns its JSON results body. */
    String query(String sparqlQuery);
}
