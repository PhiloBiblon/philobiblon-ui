package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.CacheInfo;
import org.apache.jena.query.ResultSet;

import java.io.IOException;

public interface SparqlService {

    ResultSet getSparqlQueryResult(String sparqlQuery) throws IOException;

    CacheInfo getCacheInfo();
}
