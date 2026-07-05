package io.github.philobiblon.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * A registered QuickSearch filter: a named SPARQL load-query (authored in the frontend,
 * registered at deploy time) that gets its own materialized index in SearchItem, keyed by filterId.
 */
@Entity
@Table(name = "search_filter")
public class SearchFilter {

    @Id
    @Column(length = 150)
    private String filterId;

    @Lob
    private String queryTemplate;

    @Column(length = 64)
    private String templateHash;

    private Instant registeredAt;

    private Instant lastUsedAt;

    public SearchFilter() {
    }

    public SearchFilter(String filterId, String queryTemplate, String templateHash, Instant registeredAt) {
        this.filterId = filterId;
        this.queryTemplate = queryTemplate;
        this.templateHash = templateHash;
        this.registeredAt = registeredAt;
        this.lastUsedAt = registeredAt;
    }

    public String getFilterId() {
        return filterId;
    }

    public String getQueryTemplate() {
        return queryTemplate;
    }

    public void setQueryTemplate(String queryTemplate) {
        this.queryTemplate = queryTemplate;
    }

    public String getTemplateHash() {
        return templateHash;
    }

    public void setTemplateHash(String templateHash) {
        this.templateHash = templateHash;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(Instant lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}
