package io.github.philobiblon.backend.representation;

import java.util.List;

public class QuickSearchResponse {

    public enum IndexState {
        /** filterId was never registered. */
        UNKNOWN,
        /** filterId is registered but its first load hasn't completed yet. */
        LOADING,
        /** filterId has a usable, queryable index. */
        READY
    }

    private IndexState indexState;
    private List<QuickResult> results;

    public QuickSearchResponse(IndexState indexState, List<QuickResult> results) {
        this.indexState = indexState;
        this.results = results;
    }

    public IndexState getIndexState() {
        return indexState;
    }

    /** Kept for frontend backward compatibility: true unless the index is fully READY. */
    public boolean isIndexLoading() {
        return indexState != IndexState.READY;
    }

    public List<QuickResult> getResults() {
        return results;
    }
}
