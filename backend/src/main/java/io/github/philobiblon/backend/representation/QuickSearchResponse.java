package io.github.philobiblon.backend.representation;

import java.util.List;

public class QuickSearchResponse {
    private boolean indexLoading;
    private List<QuickResult> results;

    public QuickSearchResponse(boolean indexLoading, List<QuickResult> results) {
        this.indexLoading = indexLoading;
        this.results = results;
    }

    public boolean isIndexLoading() {
        return indexLoading;
    }

    public List<QuickResult> getResults() {
        return results;
    }
}
