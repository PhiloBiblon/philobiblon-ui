package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.service.SparqlProxyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SparqlControllerImplTest {

    private SparqlProxyService sparqlProxyService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        sparqlProxyService = mock(SparqlProxyService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new SparqlControllerImpl(sparqlProxyService))
                .build();
    }

    @Test
    void returnsEndpointResultsForFormEncodedQuery() throws Exception {
        when(sparqlProxyService.query("SELECT * WHERE { ?s ?p ?o }")).thenReturn("{\"results\":{}}");

        mockMvc.perform(post("/api/sparql")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("query", "SELECT * WHERE { ?s ?p ?o }")
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"results\":{}}"));
    }
}
