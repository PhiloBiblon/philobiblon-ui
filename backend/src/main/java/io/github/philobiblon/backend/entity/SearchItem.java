package io.github.philobiblon.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * Materialized, searchable copy of an indexed item label (per filter and language).
 * Populated periodically from Wikibase so a given filter's search can be served
 * locally without hitting the (slow) SPARQL endpoint on every keystroke.
 */
@Entity
@Table(name = "search_item", indexes = {
        @Index(name = "idx_search_item_filter_lang_generation", columnList = "filterId,lang,generation")
})
public class SearchItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Identifies which registered filter this row belongs to (see SearchFilter). */
    @Column(length = 150)
    private String filterId;

    /** Wikibase Q id (extracted from the ?item URI). */
    @Column(length = 32)
    private String qid;

    /** PhiloBiblon id (P476 value) — used by the frontend to navigate to /item/{id}. */
    @Column(length = 255)
    private String pbid;

    @Column(length = 8)
    private String lang;

    /** Human readable label shown in the autocomplete. */
    @Column(length = 1000)
    private String label;

    /** Normalized (lowercased, accent-stripped) label + aliases + qid + pbid, used for LIKE matching. */
    @Column(length = 10000)
    private String searchText;

    /** Description shown below the label in the autocomplete, for disambiguation. */
    @Column(length = 1000)
    private String description;

    /** Load batch identifier; allows atomic swap between refreshes. */
    private long generation;

    public SearchItem() {
    }

    public SearchItem(String filterId, String qid, String pbid, String lang, String label, String searchText, String description, long generation) {
        this.filterId = filterId;
        this.qid = qid;
        this.pbid = pbid;
        this.lang = lang;
        this.label = label;
        this.searchText = searchText;
        this.description = description;
        this.generation = generation;
    }

    public Long getId() {
        return id;
    }

    public String getFilterId() {
        return filterId;
    }

    public String getQid() {
        return qid;
    }

    public String getPbid() {
        return pbid;
    }

    public String getLang() {
        return lang;
    }

    public String getLabel() {
        return label;
    }

    public String getSearchText() {
        return searchText;
    }

    public String getDescription() {
        return description;
    }

    public long getGeneration() {
        return generation;
    }
}
