package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.entity.CacheRefreshState;

import java.time.Instant;

/**
 * Decides, from FactGrid's change feeds, which cached queries the nightly refresh must reload:
 * a query is marked dirty when a changed item belongs to one of its source tables (condition A)
 * or when one of its cached rows represents a changed item (condition B).
 */
public interface CacheChangeTracker {

    enum Mode {
        /** Reload every registered query (first run, weekly bound, or too many changes). */
        FULL_REFRESH,
        /** Affected queries were flagged dirty; the watermark moved on. */
        MARKED,
        /** Change detection failed; nothing new was marked and the watermark did not move. */
        UNAVAILABLE
    }

    /** Result of one detection pass; {@code changedItems} is -1 when the feeds were not read. */
    record Detection(Mode mode, int changedItems) {
    }

    /** Runs one detection pass for a refresh cycle that started at {@code cycleStart}. */
    Detection detect(Instant cycleStart);

    /** Records that a cycle reloaded every query: restarts the weekly clock and moves the watermark. */
    void recordFullRefresh(Instant cycleStart);

    /** Current watermark, weekly-refresh clock and last detection failure (for the status endpoint). */
    CacheRefreshState currentState();
}
