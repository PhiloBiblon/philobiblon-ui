package io.github.philobiblon.backend.service.impl;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import io.github.philobiblon.backend.helper.MemoryStats;
import io.github.philobiblon.backend.helper.StringCompressor;
import io.github.philobiblon.backend.representation.CacheInfo;
import io.github.philobiblon.backend.service.SparqlService;
import jakarta.annotation.PostConstruct;
import org.apache.jena.query.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class SparqlServiceImpl implements SparqlService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlServiceImpl.class);

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;
    @Value("${sparql.cache.compressResults:false}")
    private boolean isCompressResults;

    private LoadingCache<String, String> sparqlCache;

    @PostConstruct
    public void init() {
        sparqlCache = Caffeine.newBuilder()
                .recordStats()
                .refreshAfterWrite(24, TimeUnit.HOURS)
                .expireAfterWrite(36, TimeUnit.HOURS)
                .build(this::executeSparqlQuery);
    }

    private String executeSparqlQuery(String sparqlQuery) {
        logger.info("Executing sparqlQuery {}...", sparqlQuery);

        Query query = QueryFactory.create(sparqlQuery);

        try (QueryExecution qexec = QueryExecution.service(sparqlEndpoint, query)) {
            ResultSet resultSet = qexec.execSelect();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ResultSetFormatter.outputAsJSON(out, resultSet);
            String jsonResult = out.toString(StandardCharsets.UTF_8);
            return isCompressResults ? StringCompressor.compress(jsonResult) : jsonResult;
        } catch (Exception e) {
            logger.error("Error executing SPARQL query", e);
            throw new RuntimeException("SPARQL query execution failed", e);
        }
    }

    public ResultSet getSparqlQueryResult(String sparqlQuery) throws IOException {
        String result = sparqlCache.get(sparqlQuery);
        String jsonResult = isCompressResults ? StringCompressor.decompress(result) : result;
        try (ByteArrayInputStream in = new ByteArrayInputStream(jsonResult.getBytes(StandardCharsets.UTF_8))) {
            return ResultSetFactory.fromJSON(in);
        }
    }

    public CacheInfo getCacheInfo() {
        // Force GC before show stats
        System.gc();

        CacheInfo info = new CacheInfo();
        Map<String, Double> sizes = new HashMap<>();

        long totalBytes = 0;

        for (Map.Entry<String, String> entry : sparqlCache.asMap().entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            if (value != null) {
                int sizeBytes = value.getBytes(StandardCharsets.UTF_8).length;
                sizes.put(key, bytes2MB(sizeBytes));
                totalBytes += sizeBytes;
            }
        }

        CacheStats stats = sparqlCache.stats();

        info.totalProcessMemory = MemoryStats.getMemoryUsage();
        info.isCompressResults = isCompressResults;
        info.totalEntriesMemory = bytes2MB(totalBytes);
        info.totalEntries = sparqlCache.estimatedSize();
        info.entrySizes = sizes;

        info.hitCount = stats.hitCount();
        info.missCount = stats.missCount();
        info.loadSuccessCount = stats.loadSuccessCount();
        info.loadFailureCount = stats.loadFailureCount();
        info.hitRate = stats.hitRate();

        return info;
    }

    private double bytes2MB(long bytes) {
        return Math.round((bytes / 1024.0 / 1024.0) * 100.0) / 100.0;
    }
}

