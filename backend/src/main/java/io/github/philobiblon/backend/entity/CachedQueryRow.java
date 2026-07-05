package io.github.philobiblon.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

/**
 * One result row of a cached SPARQL query (see {@link CachedQuery}), decomposed so the
 * search can be served with an indexed SQL LIKE instead of re-parsing a JSON blob.
 */
@Entity
@Table(name = "cached_query_row", indexes = {
        @Index(name = "idx_cached_row_hash_generation", columnList = "query_hash,generation")
})
public class CachedQueryRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_hash", length = 64)
    private String queryHash;

    /** Load batch identifier; allows atomic swap between refreshes. */
    private long generation;

    /** Human readable label shown in the autocomplete. */
    @Column(length = 1000)
    private String label;

    /** Normalized (lowercased, accent-stripped) concatenation of the query's searchVars values, used for LIKE matching. */
    @Column(name = "search_text", length = 10000)
    private String searchText;

    /** JSON of the full value map (all result vars: literals as strings, resources as Q-numbers). */
    @Lob
    private String payload;

    public CachedQueryRow() {
    }

    public CachedQueryRow(String queryHash, long generation, String label, String searchText, String payload) {
        this.queryHash = queryHash;
        this.generation = generation;
        this.label = label;
        this.searchText = searchText;
        this.payload = payload;
    }

    public Long getId() {
        return id;
    }

    public String getQueryHash() {
        return queryHash;
    }

    public long getGeneration() {
        return generation;
    }

    public String getLabel() {
        return label;
    }

    public String getSearchText() {
        return searchText;
    }

    public String getPayload() {
        return payload;
    }
}
