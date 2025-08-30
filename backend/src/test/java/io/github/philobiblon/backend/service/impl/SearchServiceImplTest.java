package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.representation.Option;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SearchServiceImplTest {

    @Test
    void testRankValue() {
        String normQuery = SearchServiceImpl.normalize("João I (D.)");
        List<String> queryWords = Arrays.asList(normQuery.split("\\s+"));
        System.out.println(SearchServiceImpl.rank(new Option("João I (D.), 10. Rei de Portugal [1385]", null), queryWords));
    }

    @Test
    void testRankValue2() {
        String normQuery = SearchServiceImpl.normalize("João I (D.)");
        List<String> queryWords = Arrays.asList(normQuery.split("\\s+"));
        System.out.println(SearchServiceImpl.rank(new Option("D. João III", null), queryWords));
    }
}
