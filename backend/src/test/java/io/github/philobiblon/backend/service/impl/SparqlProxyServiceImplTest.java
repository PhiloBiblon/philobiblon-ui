package io.github.philobiblon.backend.service.impl;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SparqlProxyServiceImplTest {

    private static final long MAX_BYTES = 100;

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
        server.stop(0);
    }

    private SparqlProxyServiceImpl service() {
        return new SparqlProxyServiceImpl("http://127.0.0.1:" + server.getAddress().getPort() + "/sparql", MAX_BYTES, 5);
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

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service().query("nope"));

        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
        assertEquals("MalformedQueryException", e.getReason());
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
                () -> new SparqlProxyServiceImpl("http://127.0.0.1:" + port + "/sparql", MAX_BYTES, 5).query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
    }

    @Test
    void slowEndpointTimesOutAsABadGateway() {
        server.createContext("/sparql", exchange -> {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
            exchange.close();
        });
        SparqlProxyServiceImpl shortTimeout =
                new SparqlProxyServiceImpl("http://127.0.0.1:" + server.getAddress().getPort() + "/sparql", MAX_BYTES, 1);

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> shortTimeout.query("ASK{}"));

        assertEquals(HttpStatus.BAD_GATEWAY, e.getStatusCode());
        assertEquals("SPARQL endpoint timed out", e.getReason());
    }
}
