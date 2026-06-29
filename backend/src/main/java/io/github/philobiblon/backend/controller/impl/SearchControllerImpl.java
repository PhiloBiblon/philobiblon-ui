package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SearchController;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
import io.github.philobiblon.backend.representation.RegisterFilterResponse;
import io.github.philobiblon.backend.service.QuickSearchService;
import io.github.philobiblon.backend.service.QuickSearchService.RegistrationResult;
import io.github.philobiblon.backend.service.SearchService;
import io.github.philobiblon.backend.service.SparqlService;
import org.apache.jena.query.ResultSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Component
public class SearchControllerImpl implements SearchController {

    private SearchService searchService;
    private SparqlService sparqlService;
    private QuickSearchService quickSearchService;

    @Autowired
    public SearchControllerImpl(SearchService searchService, SparqlService sparqlService,
                                QuickSearchService quickSearchService) {
        this.searchService = searchService;
        this.sparqlService = sparqlService;
        this.quickSearchService = quickSearchService;
    }

    public List<Option> search(String sparqlQuery, String q) throws IOException {
        ResultSet resultSet = sparqlService.getSparqlQueryResult(sparqlQuery);
        return searchService.search(resultSet, q);
    }

    public QuickSearchResponse quickSearch(String filterId, String q, String lang) {
        return quickSearchService.search(filterId, q, lang);
    }

    public RegisterFilterResponse registerQuickSearchFilter(String filterId, String queryTemplate) {
        RegistrationResult result = quickSearchService.register(filterId, queryTemplate);
        if (result == RegistrationResult.REJECTED_CAP) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "QuickSearch filter registry is at capacity");
        }
        return new RegisterFilterResponse(true, result);
    }
}
