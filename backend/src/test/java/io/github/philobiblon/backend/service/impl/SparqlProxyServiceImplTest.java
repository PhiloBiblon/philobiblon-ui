package io.github.philobiblon.backend.service.impl;

import com.sun.net.httpserver.HttpServer;
import io.github.philobiblon.backend.helper.SparqlQueryValidator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SparqlProxyServiceImplTest {

    private static final long MAX_BYTES = 100;

    private final CountDownLatch releaseSlowHandler = new CountDownLatch(1);
    private HttpServer server;
    private final AtomicReference<String> receivedBody = new AtomicReference<>();
    private final AtomicReference<String> receivedUserAgent = new AtomicReference<>();

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.start();
    }

    @AfterEach
    void stopServer() {
        releaseSlowHandler.countDown();
        server.stop(0);
    }

    private String endpoint() {
        return "http://127.0.0.1:" + server.getAddress().getPort() + "/sparql";
    }

    private SparqlProxyServiceImpl service() {
        return new SparqlProxyServiceImpl(endpoint(), MAX_BYTES, 5, 8, 10, new SparqlQueryValidator());
    }

    /** One upstream slot, a 1 s queue wait. */
    private SparqlProxyServiceImpl singleSlotService() {
        return new SparqlProxyServiceImpl(endpoint(), MAX_BYTES, 5, 1, 1, new SparqlQueryValidator());
    }

    private void respond(int status, String body, String location) {
        server.createContext("/sparql", exchange -> {
            receivedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            receivedUserAgent.set(exchange.getRequestHeaders().getFirst("User-Agent"));
            if (location != null) {
                exchange.getResponseHeaders().add("Location", location);
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
            if (bytes.length > 0) {
                exchange.getResponseBody().write(bytes);
            }
            exchange.close();
        });
    }

    @Test
    void returnsBodyAndSendsEncodedQueryWithUserAgent() {
        respond(200, "{\"results\":{}}", null);

        String result = service().query("SELECT ?s WHERE { ?s ?p \"a&b\" }");

        assertEquals("{\"results\":{}}", result);
        String[] params = receivedBody.get().split("&");
        assertEquals("query=SELECT ?s WHERE { ?s ?p \"a&b\" }", URLDecoder.decode(params[0], StandardCharsets.UTF_8));
        assertEquals("format=json", params[1]);
        assertEquals(true, receivedUserAgent.get().startsWith("PhiloBiblon-UI/"));
    }

    @Test
    void reputationChallengeRedirectIsABadGateway() {
        respond(302, "", "/rep-pow-challenge?redirect_uri=%2Fsparql");

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
        assertEquals("SPARQL endpoint reputation challenge", e.getReason());
    }

    @Test
    void clientErrorPassesThrough() {
        respond(400, "MalformedQueryException", null);

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("SELECT ?s WHERE { ?s ?p ?o }"));

        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
        assertEquals("SPARQL query rejected by the endpoint", e.getReason());
    }

    @Test
    void endpointAuthAndRateLimitErrorsAreABadGateway() {
        boolean first = true;
        for (int status : new int[] {401, 403, 429}) {
            if (!first) {
                server.removeContext("/sparql");
            }
            first = false;
            respond(status, "denied", null);

            ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("ASK{}"));

            assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode(), "status " + status);
        }
    }

    @Test
    void serverErrorIsABadGateway() {
        respond(500, "boom", null);

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
    }

    @Test
    void oversizedResponseIsABadGateway() {
        respond(200, "x".repeat((int) MAX_BYTES + 1), null);

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
        assertEquals("SPARQL response too large", e.getReason());
    }

    @Test
    void unreachableEndpointIsABadGateway() {
        int port = server.getAddress().getPort();
        server.stop(0);

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> new SparqlProxyServiceImpl("http://127.0.0.1:" + port + "/sparql", MAX_BYTES, 5, 8, 10,
                        new SparqlQueryValidator()).query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
    }

    @Test
    void slowEndpointTimesOutAsABadGateway() {
        server.createContext("/sparql", exchange -> {
            try {
                releaseSlowHandler.await(10, TimeUnit.SECONDS);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
            exchange.close();
        });
        SparqlProxyServiceImpl shortTimeout =
                new SparqlProxyServiceImpl(endpoint(), MAX_BYTES, 1, 8, 10, new SparqlQueryValidator());

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> shortTimeout.query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
        assertEquals("SPARQL endpoint timed out", e.getReason());
    }

    @Test
    void secondQueryWaitsThenGetsServiceUnavailableWhileTheOnlySlotIsBusy() throws Exception {
        CountDownLatch firstArrived = new CountDownLatch(1);
        AtomicInteger calls = new AtomicInteger();
        server.createContext("/sparql", exchange -> {
            exchange.getRequestBody().readAllBytes();
            if (calls.incrementAndGet() == 1) {
                firstArrived.countDown();
                try {
                    releaseSlowHandler.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
            byte[] bytes = "{}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        SparqlProxyServiceImpl proxy = singleSlotService();

        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> proxy.query("ASK{}"));
        assertTrue(firstArrived.await(5, TimeUnit.SECONDS));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> proxy.query("ASK{}"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        assertEquals("SPARQL proxy busy", e.getReason());
        assertEquals(1, calls.get());

        releaseSlowHandler.countDown();
        assertEquals("{}", first.get(5, TimeUnit.SECONDS));
        // The permit was released: a new query goes through.
        assertEquals("{}", proxy.query("ASK{}"));
    }

    @Test
    void permitIsReleasedAfterAnUpstreamError() {
        respond(500, "boom", null);
        SparqlProxyServiceImpl proxy = singleSlotService();

        assertThrows(ResponseStatusException.class, () -> proxy.query("ASK{}"));
        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> proxy.query("ASK{}"));

        // Still the upstream error, not a 503 from a leaked permit.
        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
    }

    @Test
    void permitIsReleasedAfterAnOversizedResponse() {
        respond(200, "x".repeat((int) MAX_BYTES + 1), null);
        SparqlProxyServiceImpl proxy = singleSlotService();

        assertThrows(ResponseStatusException.class, () -> proxy.query("ASK{}"));
        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> proxy.query("ASK{}"));

        assertEquals("SPARQL response too large", e.getReason());
    }

    @Test
    void invalidQueryIsRejectedWithoutReachingTheEndpoint() {
        respond(200, "{}", null);

        for (String query : new String[] {"nope", "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }",
                "SELECT * WHERE { SERVICE <http://example.org/sparql> { ?s ?p ?o } }"}) {
            ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query(query));
            assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode(), query);
        }
        assertEquals(null, receivedBody.get());
    }
}
