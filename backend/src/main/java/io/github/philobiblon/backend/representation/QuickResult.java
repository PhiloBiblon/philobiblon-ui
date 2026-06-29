package io.github.philobiblon.backend.representation;

/**
 * Lightweight result for the general (autocomplete) search.
 * Shape matches what the frontend's customizeSearchData expects: { qid, pbid, label, description }.
 */
public class QuickResult {
    private String qid;
    private String pbid;
    private String label;
    private String description;

    public QuickResult(String qid, String pbid, String label, String description) {
        this.qid = qid;
        this.pbid = pbid;
        this.label = label;
        this.description = description;
    }

    public String getQid() {
        return qid;
    }

    public String getPbid() {
        return pbid;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }
}
