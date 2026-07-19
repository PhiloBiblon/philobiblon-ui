package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.SearchController;
import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.SearchResponse;
import io.github.philobiblon.backend.service.SparqlCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SearchControllerImpl implements SearchController {

    private SparqlCacheService sparqlCacheService;

    @Autowired
    public SearchControllerImpl(SparqlCacheService sparqlCacheService) {
        this.sparqlCacheService = sparqlCacheService;
    }

    public SearchResponse searchV2(String sparqlQuery, String q, String searchVars, String hint, Integer limit,
                                   String lang, String group) {
        return sparqlCacheService.search(sparqlQuery, q, searchVars, hint, limit, lang, group);
    }

    public CacheStatusResponse cacheStatus() {
        return sparqlCacheService.status();
    }
}
