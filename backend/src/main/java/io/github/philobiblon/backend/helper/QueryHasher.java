package io.github.philobiblon.backend.helper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Cache key derivation for {@link io.github.philobiblon.backend.entity.CachedQuery}.
 * SHA-256 instead of a 32-bit hash: the registry is persistent and fed with arbitrary
 * client SPARQL, so real collisions would silently mix result sets.
 */
public final class QueryHasher {

    private QueryHasher() {
    }

    public static String hash(String searchVars, String sparqlText) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(searchVars.getBytes(StandardCharsets.UTF_8));
            digest.update((byte) '\n');
            digest.update(sparqlText.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
