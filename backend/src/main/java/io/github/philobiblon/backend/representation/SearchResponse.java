package io.github.philobiblon.backend.representation;

import java.util.List;

/**
 * Response of the async (v=2) /api/search contract. When {@code indexLoading} is true the
 * query's results are being materialized in the background and the client should retry.
 */
public class SearchResponse {

    private final boolean indexLoading;
    private final List<Option> results;

    public SearchResponse(boolean indexLoading, List<Option> results) {
        this.indexLoading = indexLoading;
        this.results = results;
    }

    public boolean isIndexLoading() {
        return indexLoading;
    }

    public List<Option> getResults() {
        return results;
    }
}
