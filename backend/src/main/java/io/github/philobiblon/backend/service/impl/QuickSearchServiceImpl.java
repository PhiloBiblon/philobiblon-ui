package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.SearchItem;
import io.github.philobiblon.backend.representation.QuickResult;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
import io.github.philobiblon.backend.repository.SearchItemRepository;
import io.github.philobiblon.backend.service.QuickSearchService;
import jakarta.annotation.PostConstruct;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.RDFNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Limit;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class QuickSearchServiceImpl implements QuickSearchService {

    private static final Logger logger = LoggerFactory.getLogger(QuickSearchServiceImpl.class);

    private static final int LABEL_MAX_LENGTH = 1000;
    private static final int SEARCH_TEXT_MAX_LENGTH = 10000;

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;
    @Value("${sparql.queryPrefix:}")
    private String sparqlQueryPrefix;
    @Value("${search.index.languages:ca,es,en,gl,pt}")
    private String[] languages;
    @Value("${search.index.candidateLimit:100}")
    private int candidateLimit;
    @Value("${search.index.resultLimit:20}")
    private int resultLimit;
    @Value("${search.index.retry.maxAttempts:3}")
    int retryMaxAttempts;
    @Value("${search.index.retry.initialBackoffMs:5000}")
    long retryInitialBackoffMs;
    @Value("${search.index.retry.backoffMultiplier:3}")
    double retryBackoffMultiplier;

    private final SearchItemRepository repository;

    private final Map<String, Long> generationByLang = new ConcurrentHashMap<>();
    private final AtomicBoolean refreshing = new AtomicBoolean(false);
    private String loadQueryTemplate;
    private final HttpClient http1Client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public QuickSearchServiceImpl(SearchItemRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    void init() throws IOException {
        try (var in = new ClassPathResource("sparql/load-search-items.rq").getInputStream()) {
            loadQueryTemplate = StreamUtils.copyToString(in, StandardCharsets.UTF_8);
        }
        for (String lang : languages) {
            Long maxGeneration = repository.findMaxGenerationByLang(lang.trim());
            generationByLang.put(lang.trim(), maxGeneration != null ? maxGeneration : 0L);
        }
        logger.info("QuickSearch index initialized at generations {}", generationByLang);
    }

    @Override
    public QuickSearchResponse search(String q, String lang) {
        long generation = generationByLang.getOrDefault(lang, 0L);
        if (generation == 0L) {
            return new QuickSearchResponse(true, List.of());
        }
        String term = SearchServiceImpl.normalize(q);
        if (term == null || term.isBlank()) {
            return new QuickSearchResponse(false, List.of());
        }

        String escapedTerm = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        List<SearchItem> candidates = repository.search(lang, generation, escapedTerm, Limit.of(candidateLimit));
        List<String> queryWords = Arrays.asList(term.split("\\s+"));

        List<QuickResult> results = candidates.stream()
                .filter(item -> SearchServiceImpl.rank(item.getSearchText(), queryWords) < Integer.MAX_VALUE)
                .limit(resultLimit)
                .map(item -> new QuickResult(item.getPbid(), item.getLabel(), item.getDescription()))
                .toList();
        return new QuickSearchResponse(false, results);
    }

    /** Loads the index once the application is ready, without blocking startup. */
    @EventListener(ApplicationReadyEvent.class)
    void loadOnStartup() {
        Thread thread = new Thread(this::refresh, "quick-search-initial-load");
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    @Scheduled(cron = "${search.index.refreshCron:0 0 3 * * *}")
    public void refresh() {
        if (!refreshing.compareAndSet(false, true)) {
            logger.info("QuickSearch index refresh already in progress, skipping");
            return;
        }
        long newGeneration = System.currentTimeMillis();
        logger.info("Refreshing QuickSearch index (generation {})...", newGeneration);

        List<String> succeeded = new ArrayList<>();
        List<String> failed = new ArrayList<>();
        List<String> emptyResult = new ArrayList<>();
        int totalItems = 0;

        try {
            for (String rawLang : languages) {
                String lang = rawLang.trim();
                List<SearchItem> items = loadLanguageWithRetry(lang, newGeneration);
                if (items == null) {
                    failed.add(lang);
                    continue;
                }
                if (items.isEmpty()) {
                    logger.warn("QuickSearch index refresh produced no items for language '{}'; keeping previous generation {}",
                            lang, generationByLang.getOrDefault(lang, 0L));
                    emptyResult.add(lang);
                    continue;
                }

                repository.saveAll(items);
                generationByLang.put(lang, newGeneration);
                long removed = repository.deleteByLangAndGenerationNot(lang, newGeneration);
                logger.info("QuickSearch index refreshed for language '{}': {} items, generation {}, {} stale rows removed",
                        lang, items.size(), newGeneration, removed);
                succeeded.add(lang);
                totalItems += items.size();
            }

            long elapsedMs = System.currentTimeMillis() - newGeneration;
            String summary = "QuickSearch index refresh finished in {} ms: {} succeeded {} ({} items), {} failed {}, {} empty {}";
            if (failed.isEmpty()) {
                logger.info(summary, elapsedMs, succeeded.size(), succeeded, totalItems, failed.size(), failed, emptyResult.size(), emptyResult);
            } else {
                logger.warn(summary, elapsedMs, succeeded.size(), succeeded, totalItems, failed.size(), failed, emptyResult.size(), emptyResult);
            }
        } finally {
            refreshing.set(false);
        }
    }

    /** Loads a language's items, retrying with exponential backoff. Returns null if all attempts fail. */
    List<SearchItem> loadLanguageWithRetry(String lang, long generation) {
        int attempt = 1;
        long backoffMs = retryInitialBackoffMs;
        while (true) {
            try {
                return loadLanguage(lang, generation);
            } catch (Exception e) {
                if (attempt >= retryMaxAttempts) {
                    logger.error("QuickSearch: giving up loading language '{}' after {} attempts; keeping previous generation {}",
                            lang, attempt, generationByLang.getOrDefault(lang, 0L), e);
                    return null;
                }
                logger.warn("QuickSearch: attempt {}/{} failed for language '{}', retrying in {} ms",
                        attempt, retryMaxAttempts, lang, backoffMs, e);
                sleep(backoffMs);
                backoffMs = (long) (backoffMs * retryBackoffMultiplier);
                attempt++;
            }
        }
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    List<SearchItem> loadLanguage(String lang, long generation) {
        String sparqlQuery = addPrefixes(loadQueryTemplate.replace("${lang}", lang));
        Query query = QueryFactory.create(sparqlQuery);

        Map<String, Accumulator> byItem = new LinkedHashMap<>();
        try (QueryExecution qexec = QueryExecution.service(sparqlEndpoint)
                .query(query)
                .httpClient(http1Client)
                .timeout(15, TimeUnit.MINUTES)
                .build()) {
            ResultSet resultSet = qexec.execSelect();
            while (resultSet.hasNext()) {
                QuerySolution solution = resultSet.next();
                String qid = solution.contains("item") ? extractQid(solution.get("item")) : null;
                String pbid = literal(solution, "pbid");
                if (qid == null || pbid == null) {
                    continue;
                }
                Accumulator acc = byItem.computeIfAbsent(qid, k -> new Accumulator(pbid));
                acc.pbids.add(pbid);
                String label = literal(solution, "label");
                if (label != null) {
                    acc.label = label;
                }
                addIfPresent(acc.aliases, literal(solution, "alias"));
                if (acc.description == null) {
                    acc.description = literal(solution, "desc");
                }
            }
        }

        List<SearchItem> items = new ArrayList<>(byItem.size());
        for (Map.Entry<String, Accumulator> entry : byItem.entrySet()) {
            Accumulator acc = entry.getValue();
            String label = acc.label != null ? acc.label : acc.pbid;
            StringBuilder searchSource = new StringBuilder(label);
            for (String extra : acc.aliases) {
                searchSource.append(' ').append(extra);
            }
            searchSource.append(' ').append(entry.getKey());
            for (String pbid : acc.pbids) {
                searchSource.append(' ').append(pbid);
            }
            String searchText = SearchServiceImpl.normalize(searchSource.toString());
            items.add(new SearchItem(
                    entry.getKey(),
                    acc.pbid,
                    lang,
                    truncate(label, LABEL_MAX_LENGTH),
                    truncate(searchText, SEARCH_TEXT_MAX_LENGTH),
                    truncate(acc.description, LABEL_MAX_LENGTH),
                    generation));
        }
        logger.info("Loaded {} items for language '{}'", items.size(), lang);
        return items;
    }

    private String addPrefixes(String query) {
        if (sparqlQueryPrefix != null && !sparqlQueryPrefix.isBlank()) {
            return sparqlQueryPrefix.replace("\\n", "\n") + "\n" + query;
        }
        return query;
    }

    private static void addIfPresent(Set<String> target, String value) {
        if (value != null && !value.isBlank()) {
            target.add(value);
        }
    }

    private static String literal(QuerySolution solution, String var) {
        if (!solution.contains(var)) {
            return null;
        }
        RDFNode node = solution.get(var);
        return node.isLiteral() ? node.asLiteral().getString() : node.toString();
    }

    private static String extractQid(RDFNode node) {
        if (node == null || !node.isResource()) {
            return null;
        }
        String uri = node.asResource().getURI();
        return uri.substring(uri.lastIndexOf('/') + 1);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() > max ? value.substring(0, max) : value;
    }

    private static final class Accumulator {
        /** Canonical pbid (first one encountered), used for the item's stored/navigable id. */
        private final String pbid;
        private String label;
        private String description;
        private final Set<String> aliases = new LinkedHashSet<>();
        /** All P476 values seen for this item (an item can have several, e.g. one per linked database). */
        private final Set<String> pbids = new LinkedHashSet<>();

        private Accumulator(String pbid) {
            this.pbid = pbid;
            this.pbids.add(pbid);
        }
    }
}
