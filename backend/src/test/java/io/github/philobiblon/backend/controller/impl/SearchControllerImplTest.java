package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.SearchResponse;
import io.github.philobiblon.backend.service.QuickSearchService;
import io.github.philobiblon.backend.service.SparqlCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Both /api/search contracts (legacy bare array vs v=2 envelope) must coexist on the same path. */
class SearchControllerImplTest {

    private SparqlCacheService sparqlCacheService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        sparqlCacheService = mock(SparqlCacheService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new SearchControllerImpl(sparqlCacheService, mock(QuickSearchService.class)))
                .build();
    }

    @Test
    void legacyRequestWithoutVersionReturnsBareArray() throws Exception {
        when(sparqlCacheService.searchLegacy(anyString(), anyString()))
                .thenReturn(List.of(new Option("Barcelona", Map.of("item", "Q42"))));

        mockMvc.perform(post("/api/search")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("sparqlQuery", "SELECT ?label WHERE {}")
                        .param("q", "barcelona"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].text").value("Barcelona"))
                .andExpect(jsonPath("$[0].value.item").value("Q42"));
    }

    @Test
    void v2RequestReturnsEnvelopeWithIndexLoadingFlag() throws Exception {
        when(sparqlCacheService.search(anyString(), anyString(), eq("label,pbid"), eq("bioid.author"), any()))
                .thenReturn(new SearchResponse(true, List.of()));

        mockMvc.perform(post("/api/search")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("v", "2")
                        .param("sparqlQuery", "SELECT ?label WHERE {}")
                        .param("q", "barcelona")
                        .param("searchVars", "label,pbid")
                        .param("hint", "bioid.author"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.indexLoading").value(true))
                .andExpect(jsonPath("$.results").isArray());
    }

    @Test
    void v2WarmRequestReturnsResultsInsideEnvelope() throws Exception {
        when(sparqlCacheService.search(anyString(), anyString(), any(), any(), any()))
                .thenReturn(new SearchResponse(false, List.of(new Option("Barcelona", Map.of("item", "Q42")))));

        mockMvc.perform(post("/api/search")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("v", "2")
                        .param("sparqlQuery", "SELECT ?label WHERE {}")
                        .param("q", "barcelona"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.indexLoading").value(false))
                .andExpect(jsonPath("$.results[0].text").value("Barcelona"));
    }
}
