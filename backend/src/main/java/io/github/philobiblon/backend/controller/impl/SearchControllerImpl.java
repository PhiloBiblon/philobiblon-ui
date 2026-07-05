package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SearchController;
import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
import io.github.philobiblon.backend.representation.SearchResponse;
import io.github.philobiblon.backend.service.QuickSearchService;
import io.github.philobiblon.backend.service.SparqlCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SearchControllerImpl implements SearchController {

    private SparqlCacheService sparqlCacheService;
    private QuickSearchService quickSearchService;

    @Autowired
    public SearchControllerImpl(SparqlCacheService sparqlCacheService, QuickSearchService quickSearchService) {
        this.sparqlCacheService = sparqlCacheService;
        this.quickSearchService = quickSearchService;
    }

    public List<Option> search(String sparqlQuery, String q) {
        return sparqlCacheService.searchLegacy(sparqlQuery, q);
    }

    public SearchResponse searchV2(String sparqlQuery, String q, String searchVars, String hint, Integer limit) {
        return sparqlCacheService.search(sparqlQuery, q, searchVars, hint, limit);
    }

    public QuickSearchResponse quickSearch(String q, String lang) {
        return quickSearchService.search(q, lang);
    }

    public CacheStatusResponse cacheStatus() {
        return sparqlCacheService.status();
    }
}
