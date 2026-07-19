package io.github.philobiblon.backend.helper;

/**
 * The BITAGAP thematic subgroups a bg-aware cached query materializes row membership
 * for. A bg-aware query projects a {@code ?bg} var (derived from whether a related
 * BITAGAP subject label contains the "[Cartas de]" marker); the collected values per
 * row are stored in the {@code bitagap_groups} column and filtered with the v=2
 * {@code bitagapGroup} request param.
 */
public enum CacheBitagapGroup {

    ORIG("ORIG"),
    CARTAS("CARTAS");

    private final String code;

    CacheBitagapGroup(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    /**
     * Returns null for null/blank/"ALL" (no filter); throws IllegalArgumentException for an
     * unknown code.
     */
    public static CacheBitagapGroup from(String code) {
        if (code == null || code.isBlank() || "ALL".equalsIgnoreCase(code.trim())) {
            return null;
        }
        for (CacheBitagapGroup group : values()) {
            if (group.code.equalsIgnoreCase(code.trim())) {
                return group;
            }
        }
        throw new IllegalArgumentException("Unsupported BITAGAP subgroup: " + code);
    }
}
