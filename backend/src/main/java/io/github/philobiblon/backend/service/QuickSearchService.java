package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.QuickSearchResponse;

public interface QuickSearchService {

    /**
     * Searches the locally materialized index for items whose label/aliases/description
     * contain the given (normalized) term, for the given language.
     */
    QuickSearchResponse search(String q, String lang);

    /**
     * Rebuilds the local search index from Wikibase and atomically swaps it in.
     */
    void refresh();
}
