package io.github.philobiblon.backend.service.impl;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

public class SearchServiceImplTest {

    @Test
    void testRankValue() {
        String normQuery = SearchServiceImpl.normalize("Notário");
        List<String> queryWords = Arrays.asList(normQuery.split("\\s+"));
        System.out.println(SearchServiceImpl.rank("notario del rei", queryWords));
    }

    @Test
    void testRankValue2() {
        String normQuery = SearchServiceImpl.normalize("Notário");
        List<String> queryWords = Arrays.asList(normQuery.split("\\s+"));
        System.out.println(SearchServiceImpl.rank("Notario geral", queryWords));
    }
}
