package io.github.philobiblon.backend.helper;

/**
 * The UI languages a lang-aware cached query materializes per-language columns for.
 * Owns the JPQL attribute names so the dynamic search query can only ever interpolate
 * values from this whitelist, never client input.
 */
public enum CacheLang {

    EN("en", "labelEn", "searchTextEn"),
    CA("ca", "labelCa", "searchTextCa"),
    ES("es", "labelEs", "searchTextEs"),
    GL("gl", "labelGl", "searchTextGl"),
    PT("pt", "labelPt", "searchTextPt");

    private final String code;
    private final String labelAttribute;
    private final String searchTextAttribute;

    CacheLang(String code, String labelAttribute, String searchTextAttribute) {
        this.code = code;
        this.labelAttribute = labelAttribute;
        this.searchTextAttribute = searchTextAttribute;
    }

    public String getCode() {
        return code;
    }

    public String getLabelAttribute() {
        return labelAttribute;
    }

    public String getSearchTextAttribute() {
        return searchTextAttribute;
    }

    /** Returns null for null/blank input; throws IllegalArgumentException for an unknown code. */
    public static CacheLang from(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        for (CacheLang lang : values()) {
            if (lang.code.equalsIgnoreCase(code.trim())) {
                return lang;
            }
        }
        throw new IllegalArgumentException("Unsupported language: " + code);
    }
}
