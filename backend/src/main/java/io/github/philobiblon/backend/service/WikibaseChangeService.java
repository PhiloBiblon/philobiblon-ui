package io.github.philobiblon.backend.service;

import java.time.Instant;
import java.util.Set;

/** Reads FactGrid's change feeds to learn which items were edited, created or deleted in a time window. */
public interface WikibaseChangeService {

    /**
     * Distinct Q-IDs edited or created in the item namespace within [since, until].
     *
     * @throws RuntimeException when the feed cannot be read
     *                                      (network error, reputation challenge, non-2xx, bad body, API error)
     */
    Set<String> changedItems(Instant since, Instant until);

    /** Distinct Q-IDs deleted in the item namespace within [since, until]; same failure contract. */
    Set<String> deletedItems(Instant since, Instant until);
}
