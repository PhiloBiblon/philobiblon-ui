package io.github.philobiblon.backend.service.impl;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WikibaseChangeServiceImplTest {

    private static final Instant SINCE = Instant.parse("2026-11-13T00:00:00Z");
    private static final Instant UNTIL = Instant.parse("2026-11-14T00:00:00Z");

    private HttpServer server;
    private final List<String> queries = new ArrayList<>();
    private Function<String, Response> handler;

    private record Response(int status, String body, String location) {
        Response(int status, String body) {
            this(status, body, null);
        }
    }

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/w/api.php", exchange -> {
            String query = exchange.getRequestURI().getRawQuery();
            queries.add(query);
            Response response = handler.apply(query);
            byte[] body = response.body().getBytes(StandardCharsets.UTF_8);
            if (response.location() != null) {
                exchange.getResponseHeaders().add("Location", response.location());
            }
            exchange.sendResponseHeaders(response.status(), body.length == 0 ? -1 : body.length);
            if (body.length > 0) {
                exchange.getResponseBody().write(body);
            }
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    private WikibaseChangeServiceImpl service() {
        return new WikibaseChangeServiceImpl("http://127.0.0.1:" + server.getAddress().getPort() + "/w/api.php", 120);
    }

    @Test
    void followsContinuationStripsPrefixAndDeduplicates() {
        handler = query -> query.contains("rccontinue=")
                ? new Response(200, "{\"query\":{\"recentchanges\":[{\"title\":\"Item:Q2\"},{\"title\":\"Item:Q1\"}]}}")
                : new Response(200, "{\"continue\":{\"rccontinue\":\"20261113|99\"},"
                + "\"query\":{\"recentchanges\":[{\"title\":\"Item:Q1\"},{\"title\":\"Item:Q3\"}]}}");

        Set<String> items = service().changedItems(SINCE, UNTIL);

        assertEquals(Set.of("Q1", "Q2", "Q3"), items);
        assertEquals(2, queries.size());
        assertTrue(queries.get(0).contains("list=recentchanges"));
        assertTrue(queries.get(0).contains("rcnamespace=120"));
        assertTrue(queries.get(0).contains("rcstart=2026-11-14T00%3A00%3A00Z"));
        assertTrue(queries.get(0).contains("rcend=2026-11-13T00%3A00%3A00Z"));
        assertTrue(queries.get(1).contains("rccontinue=20261113%7C99"));
    }

    @Test
    void readsDeletionLog() {
        handler = query -> new Response(200, "{\"query\":{\"logevents\":[{\"title\":\"Item:Q7\"}]}}");

        assertEquals(Set.of("Q7"), service().deletedItems(SINCE, UNTIL));
        assertTrue(queries.get(0).contains("list=logevents"));
        assertTrue(queries.get(0).contains("letype=delete"));
    }

    @Test
    void reputationChallengeRedirectIsAnError() {
        handler = query -> new Response(302, "", "https://example.org/rep-pow-challenge?x=1");

        assertThrows(IllegalStateException.class, () -> service().changedItems(SINCE, UNTIL));
    }

    @Test
    void apiErrorObjectIsAnError() {
        handler = query -> new Response(200, "{\"error\":{\"code\":\"badvalue\",\"info\":\"bad\"}}");

        assertThrows(IllegalStateException.class, () -> service().changedItems(SINCE, UNTIL));
    }

    @Test
    void nonJsonAndNon2xxAreErrors() {
        handler = query -> new Response(200, "<html>challenge</html>");
        assertThrows(IllegalStateException.class, () -> service().changedItems(SINCE, UNTIL));

        handler = query -> new Response(503, "down");
        assertThrows(IllegalStateException.class, () -> service().deletedItems(SINCE, UNTIL));
    }
}
