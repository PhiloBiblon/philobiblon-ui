package io.github.philobiblon.backend.helper;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SparqlQueryValidatorTest {

    private static final String FACTGRID_PREFIXES = """
            PREFIX wd: <https://database.factgrid.de/entity/>
            PREFIX wdt: <https://database.factgrid.de/prop/direct/>
            PREFIX wikibase: <http://wikiba.se/ontology#>
            PREFIX bd: <http://www.bigdata.com/rdf#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            """;

    private final SparqlQueryValidator validator = new SparqlQueryValidator();

    private ResponseStatusException rejected(String query) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> validator.validate(query));
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
        return e;
    }

    @Test
    void acceptsSelectWithWikibaseLabelService() {
        assertDoesNotThrow(() -> validator.validate(FACTGRID_PREFIXES + """
                SELECT ?item ?itemLabel WHERE {
                  ?item wdt:P2 wd:Q1 .
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }"""));
    }

    @Test
    void acceptsAsk() {
        assertDoesNotThrow(() -> validator.validate("ASK { ?s ?p ?o }"));
    }

    @Test
    void acceptsQueryWithFactgridPrefixesAsTheFrontendSendsIt() {
        assertDoesNotThrow(() -> validator.validate(FACTGRID_PREFIXES
                + "SELECT ?item ?label WHERE { ?item wdt:P131 wd:Q10 ; rdfs:label ?label } LIMIT 10"));
    }

    @Test
    void acceptsBuiltinPrefixesWithOnlyTheDevPrefixDeclared() {
        String devPrefix = "PREFIX wd: <https://database.factgrid.de/entity/>\n"
                + "PREFIX wdt: <https://database.factgrid.de/prop/direct/>\n";
        assertDoesNotThrow(() -> validator.validate(devPrefix + """
                SELECT ?item ?itemLabel WHERE {
                  ?item wdt:P2 wd:Q1 ; wdt:P3 ?d .
                  FILTER(xsd:integer(?d) > 3)
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                } ORDER BY xsd:dateTime(?d)"""));
    }

    @Test
    void rejectsConstruct() {
        assertEquals("Only SELECT and ASK queries are allowed",
                rejected("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }").getReason());
    }

    @Test
    void rejectsDescribe() {
        assertEquals("Only SELECT and ASK queries are allowed", rejected("DESCRIBE <http://example.org/x>").getReason());
    }

    @Test
    void rejectsForeignService() {
        String reason = rejected("SELECT * WHERE { SERVICE <http://example.org/sparql> { ?s ?p ?o } }").getReason();
        assertEquals("SERVICE http://example.org/sparql is not allowed", reason);
    }

    @Test
    void rejectsForeignServiceInsideASubquery() {
        rejected("SELECT ?s WHERE { { SELECT ?s WHERE { SERVICE <http://example.org/sparql> { ?s ?p ?o } } } }");
    }

    @Test
    void rejectsForeignServiceInsideFilterExists() {
        rejected("SELECT ?s WHERE { ?s ?p ?o FILTER EXISTS { SERVICE <http://example.org/sparql> { ?s ?p ?o } } }");
    }

    @Test
    void rejectsSyntaxError() {
        assertTrue(rejected("SELECT ?s WHERE { ?s ?p").getReason().startsWith("Invalid SPARQL query: "));
    }

    @Test
    void rejectsUndeclaredPrefix() {
        assertTrue(rejected("SELECT ?s WHERE { ?s ?p nope:Q1 }").getReason().startsWith("Invalid SPARQL query: "));
    }

    @Test
    void rejectsSparqlUpdate() {
        assertTrue(rejected("INSERT DATA { <http://example.org/a> <http://example.org/b> \"c\" }").getReason()
                .startsWith("Invalid SPARQL query: "));
    }

    @Test
    void rejectsForeignServiceInsideBindNotExists() {
        rejected("SELECT ?s ?b WHERE { ?s ?p ?o BIND(NOT EXISTS { SERVICE <http://example.org/sparql> { ?s ?p ?o } } AS ?b) }");
    }

    @Test
    void rejectsForeignServiceInsideSelectExpressionAndOrderBy() {
        rejected("SELECT (EXISTS { SERVICE <http://example.org/sparql> { ?s ?p ?o } } AS ?b) WHERE { ?s ?p ?o }");
        rejected("SELECT ?s WHERE { ?s ?p ?o } ORDER BY (EXISTS { SERVICE <http://example.org/sparql> { ?s ?p ?o } })");
    }

    @Test
    void rejectsForeignServiceNestedInsideTheLabelService() {
        rejected("PREFIX wikibase: <http://wikiba.se/ontology#> SELECT * WHERE { SERVICE wikibase:label { "
                + "SERVICE <http://example.org/sparql> { ?s ?p ?o } } }");
    }

    @Test
    void rejectsVariableService() {
        rejected("SELECT * WHERE { VALUES ?e { <http://example.org/sparql> } SERVICE ?e { ?s ?p ?o } }");
    }

    @Test
    void rejectsForeignServiceInsideGroupByAndAggregatesAndHaving() {
        String exists = "EXISTS { SERVICE <http://example.org/sparql> { ?s ?p ?o } }";
        rejected("SELECT ?b (COUNT(?s) AS ?n) WHERE { ?s ?p ?o } GROUP BY (" + exists + " AS ?b)");
        rejected("SELECT (SUM(IF(" + exists + ", 1, 0)) AS ?n) WHERE { ?s ?p ?o }");
        rejected("SELECT ?p (COUNT(?s) AS ?n) WHERE { ?s ?p ?o } GROUP BY ?p HAVING (" + exists + ")");
    }

    @Test
    void acceptsOrderByGroupByAndAggregatesWithoutService() {
        assertDoesNotThrow(() -> validator.validate(
                "SELECT ?p (COUNT(?s) AS ?n) WHERE { ?s ?p ?o } GROUP BY ?p HAVING (COUNT(?s) > 1) ORDER BY DESC(?n)"));
    }
}
