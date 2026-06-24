package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.QuickSearchResponse;

public interface QuickSearchService {

    /**
     * Searches the locally materialized index for the given filter, for items whose
     * label/aliases/description contain the given (normalized) term, for the given language.
     */
    QuickSearchResponse search(String filterId, String q, String lang);

    /**
     * Rebuilds every registered filter's local search index from Wikibase and atomically swaps it in.
     */
    void refresh();

    /**
     * Registers (or re-registers, if the template changed) a filter's SPARQL load-query template.
     * Triggers an immediate async index load for new/changed registrations.
     */
    RegistrationResult register(String filterId, String queryTemplate);

    enum RegistrationResult {
        /** A brand-new filterId was registered; an initial load was triggered. */
        REGISTERED_NEW,
        /** filterId was already registered with the exact same template; no-op. */
        ALREADY_REGISTERED,
        /** filterId was already registered but the template changed; a reload was triggered. */
        TEMPLATE_UPDATED,
        /** filterId is new but the registry is already at search.index.maxFilters. */
        REJECTED_CAP
    }
}
