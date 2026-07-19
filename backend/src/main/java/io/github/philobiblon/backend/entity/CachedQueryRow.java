package io.github.philobiblon.backend.entity;

import io.github.philobiblon.backend.helper.CacheLang;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.util.Map;

/**
 * One result row of a cached SPARQL query (see {@link CachedQuery}), decomposed so the
 * search can be served with an indexed SQL LIKE instead of re-parsing a JSON blob.
 *
 * Two layouts coexist: legacy per-language queries fill the single {@code label}/{@code searchText}
 * pair; lang-aware queries (those projecting a {@code ?lang} var) fill one label/searchText
 * column per {@link CacheLang} and leave the legacy pair null. Empty per-language columns are
 * fallback-filled at materialization time, so every lang column of a lang-aware row is non-null.
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

    @Column(name = "label_en", length = 1000)
    private String labelEn;

    @Column(name = "label_ca", length = 1000)
    private String labelCa;

    @Column(name = "label_es", length = 1000)
    private String labelEs;

    @Column(name = "label_gl", length = 1000)
    private String labelGl;

    @Column(name = "label_pt", length = 1000)
    private String labelPt;

    @Column(name = "search_text_en", length = 10000)
    private String searchTextEn;

    @Column(name = "search_text_ca", length = 10000)
    private String searchTextCa;

    @Column(name = "search_text_es", length = 10000)
    private String searchTextEs;

    @Column(name = "search_text_gl", length = 10000)
    private String searchTextGl;

    @Column(name = "search_text_pt", length = 10000)
    private String searchTextPt;

    /**
     * Database-group membership for db-aware queries: space-delimited padded tokens
     * (e.g. " BETA BITECA "), matched with LIKE '% BETA %'. Null for non-db-aware rows.
     */
    @Column(name = "db_groups", length = 32)
    private String dbGroups;

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

    public CachedQueryRow(String queryHash, long generation,
                          Map<CacheLang, String> labels, Map<CacheLang, String> searchTexts, String payload) {
        this.queryHash = queryHash;
        this.generation = generation;
        this.payload = payload;
        labels.forEach(this::setLabel);
        searchTexts.forEach(this::setSearchText);
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

    /** Language-resolved label: the requested language's column, or the legacy column when lang is null. */
    public String getLabel(CacheLang lang) {
        if (lang == null) {
            return label;
        }
        return switch (lang) {
            case EN -> labelEn;
            case CA -> labelCa;
            case ES -> labelEs;
            case GL -> labelGl;
            case PT -> labelPt;
        };
    }

    /** Language-resolved search text: the requested language's column, or the legacy column when lang is null. */
    public String getSearchText(CacheLang lang) {
        if (lang == null) {
            return searchText;
        }
        return switch (lang) {
            case EN -> searchTextEn;
            case CA -> searchTextCa;
            case ES -> searchTextEs;
            case GL -> searchTextGl;
            case PT -> searchTextPt;
        };
    }

    private void setLabel(CacheLang lang, String value) {
        switch (lang) {
            case EN -> labelEn = value;
            case CA -> labelCa = value;
            case ES -> labelEs = value;
            case GL -> labelGl = value;
            case PT -> labelPt = value;
        }
    }

    private void setSearchText(CacheLang lang, String value) {
        switch (lang) {
            case EN -> searchTextEn = value;
            case CA -> searchTextCa = value;
            case ES -> searchTextEs = value;
            case GL -> searchTextGl = value;
            case PT -> searchTextPt = value;
        }
    }

    public String getDbGroups() {
        return dbGroups;
    }

    public void setDbGroups(String dbGroups) {
        this.dbGroups = dbGroups;
    }

    public String getPayload() {
        return payload;
    }
}
