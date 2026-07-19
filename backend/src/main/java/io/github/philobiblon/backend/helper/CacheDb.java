package io.github.philobiblon.backend.helper;

/**
 * The PhiloBiblon bibliographies (database groups) a db-aware cached query materializes
 * row membership for. A db-aware query projects a {@code ?db} var (the pbid prefix of the
 * group-bearing source record); the collected values per row are stored in the
 * {@code db_groups} column and filtered with the v=2 {@code group} request param.
 */
public enum CacheDb {

    BETA("BETA"),
    BITECA("BITECA"),
    BITAGAP("BITAGAP");

    private final String code;

    CacheDb(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    /**
     * Returns null for null/blank/"ALL" (no filter); throws IllegalArgumentException for an
     * unknown code.
     */
    public static CacheDb from(String code) {
        if (code == null || code.isBlank() || "ALL".equalsIgnoreCase(code.trim())) {
            return null;
        }
        for (CacheDb db : values()) {
            if (db.code.equalsIgnoreCase(code.trim())) {
                return db;
            }
        }
        throw new IllegalArgumentException("Unsupported database group: " + code);
    }
}
