package io.github.philobiblon.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.philobiblon.backend.helper.UpstreamHttp;
import io.github.philobiblon.backend.service.WikibaseChangeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Service
public class WikibaseChangeServiceImpl implements WikibaseChangeService {

    private static final int PAGE_SIZE = 500;
    private static final int MAX_PAGES = 1000;
    private static final int ERROR_SNIPPET_LENGTH = 200;
    private static final String ITEM_PREFIX = "Item:";

    private final String apiUrl;
    private final int itemNamespace;
    private final ObjectMapper objectMapper = new ObjectMapper();
    // Redirects are not followed (HttpClient default): a reputation challenge must surface as an error.
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public WikibaseChangeServiceImpl(@Value("${wikibase.apiUrl}") String apiUrl,
                                     @Value("${wikibase.itemNamespace:120}") int itemNamespace) {
        this.apiUrl = apiUrl;
        this.itemNamespace = itemNamespace;
    }

    @Override
    public Set<String> changedItems(Instant since, Instant until) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("list", "recentchanges");
        params.put("rcnamespace", String.valueOf(itemNamespace));
        params.put("rctype", "edit|new");
        params.put("rcprop", "title");
        params.put("rclimit", String.valueOf(PAGE_SIZE));
        // Default direction is newest first: "rcstart" is the newer bound, "rcend" the older one.
        params.put("rcstart", apiTimestamp(until));
        params.put("rcend", apiTimestamp(since));
        return collect(params, "recentchanges", "rccontinue");
    }

    @Override
    public Set<String> deletedItems(Instant since, Instant until) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("list", "logevents");
        params.put("letype", "delete");
        params.put("lenamespace", String.valueOf(itemNamespace));
        params.put("leprop", "title");
        params.put("lelimit", String.valueOf(PAGE_SIZE));
        params.put("lestart", apiTimestamp(until));
        params.put("leend", apiTimestamp(since));
        return collect(params, "logevents", "lecontinue");
    }

    /**
     * MediaWiki rejects ISO 8601 timestamps with fractional seconds ("badtimestamp"), which
     * {@link Instant#toString()} emits whenever there are any. Truncating floors both bounds; the
     * tracker's overlap window already absorbs the sub-second shift.
     */
    static String apiTimestamp(Instant instant) {
        return instant.truncatedTo(ChronoUnit.SECONDS).toString();
    }

    private Set<String> collect(Map<String, String> params, String listName, String continueKey) {
        Set<String> ids = new LinkedHashSet<>();
        String continuation = null;
        for (int page = 0; page < MAX_PAGES; page++) {
            Map<String, String> pageParams = new LinkedHashMap<>(params);
            if (continuation != null) {
                pageParams.put(continueKey, continuation);
            }
            JsonNode root = get(pageParams);
            for (JsonNode entry : root.path("query").path(listName)) {
                String title = entry.path("title").asText("");
                String id = title.startsWith(ITEM_PREFIX) ? title.substring(ITEM_PREFIX.length()) : title;
                if (!id.isBlank()) {
                    ids.add(id);
                }
            }
            JsonNode next = root.path("continue").path(continueKey);
            if (next.isMissingNode() || next.isNull()) {
                return ids;
            }
            continuation = next.asText();
        }
        throw new IllegalStateException("Wikibase " + listName + " feed did not end after " + MAX_PAGES + " pages");
    }

    private JsonNode get(Map<String, String> params) {
        StringBuilder url = new StringBuilder(apiUrl).append(apiUrl.contains("?") ? '&' : '?')
                .append("action=query&format=json");
        params.forEach((key, value) -> url.append('&').append(key).append('=')
                .append(URLEncoder.encode(value, StandardCharsets.UTF_8)));
        HttpRequest request = HttpRequest.newBuilder(URI.create(url.toString()))
                .timeout(Duration.ofSeconds(60))
                .header("Accept", "application/json")
                .header("User-Agent", UpstreamHttp.USER_AGENT)
                .GET()
                .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            String location = response.headers().firstValue("Location").orElse("");
            if (location.contains(UpstreamHttp.REPUTATION_CHALLENGE_PATH)) {
                throw new IllegalStateException("Wikibase API answered " + status + " with a reputation challenge");
            }
            String body = response.body();
            if (status / 100 != 2) {
                throw new IllegalStateException("Wikibase API answered " + status + ": " + snippet(body));
            }
            JsonNode root;
            try {
                root = objectMapper.readTree(body);
            } catch (IOException e) {
                throw new IllegalStateException("Wikibase API answered a non-JSON body: " + snippet(body), e);
            }
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Wikibase API answered a non-JSON body: " + snippet(body));
            }
            if (root.has("error")) {
                throw new IllegalStateException("Wikibase API error: " + snippet(root.get("error").toString()));
            }
            return root;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Wikibase API request interrupted", e);
        }
    }

    private static String snippet(String body) {
        if (body == null) {
            return "";
        }
        return body.length() > ERROR_SNIPPET_LENGTH ? body.substring(0, ERROR_SNIPPET_LENGTH) : body;
    }
}
