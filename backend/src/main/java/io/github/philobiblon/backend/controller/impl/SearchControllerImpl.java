package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SearchController;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.service.SearchService;
import io.github.philobiblon.backend.service.SparqlService;
import org.apache.jena.query.ResultSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class SearchControllerImpl implements SearchController {

    private SearchService searchService;
    private SparqlService sparqlService;

    @Autowired
    public SearchControllerImpl(SearchService searchService, SparqlService sparqlService) {
        this.searchService = searchService;
        this.sparqlService = sparqlService;
    }

    public List<Option> search(String sparqlQuery, String q) throws IOException {
        ResultSet resultSet = sparqlService.getSparqlQueryResult(sparqlQuery);
        return searchService.search(resultSet, q);
    }
}
