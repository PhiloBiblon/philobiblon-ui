package io.github.philobiblon.backend.helper;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QueryHasherTest {

    @Test
    void isDeterministic() {
        assertEquals(QueryHasher.hash("label", "SELECT ?label WHERE {}"),
                QueryHasher.hash("label", "SELECT ?label WHERE {}"));
    }

    @Test
    void differentQueryTextProducesDifferentHash() {
        assertNotEquals(QueryHasher.hash("label", "SELECT ?a WHERE {}"),
                QueryHasher.hash("label", "SELECT ?b WHERE {}"));
    }

    @Test
    void differentSearchVarsProduceDifferentHash() {
        assertNotEquals(QueryHasher.hash("label", "SELECT ?label WHERE {}"),
                QueryHasher.hash("label,pbid", "SELECT ?label WHERE {}"));
    }

    @Test
    void producesLowercaseHex64() {
        String hash = QueryHasher.hash("label", "SELECT ?label WHERE {}");
        assertEquals(64, hash.length());
        assertTrue(hash.matches("[0-9a-f]{64}"));
    }
}
