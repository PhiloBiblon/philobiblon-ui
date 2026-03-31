# SPARQL Caching

This document explains the caching strategy for SPARQL queries in the backend.

## Why Cache SPARQL Queries?

SPARQL queries can be expensive:

- **Network latency**: Round-trip to SPARQL endpoint
- **Query execution time**: Complex queries take seconds
- **Resource usage**: CPU and memory on SPARQL server

Caching provides:

- **Faster response times**: Instant results for cached queries
- **Reduced load**: Fewer requests to SPARQL endpoint
- **Better UX**: Snappier search interface

## Caching Strategy

### Two-Level Caching

1. **Frontend (Vuex)**: Client-side cache in browser
2. **Backend (Caffeine)**: Server-side cache shared across users

```
┌──────────┐         ┌─────────┐         ┌────────────┐
│ Frontend │────────>│ Backend │────────>│   SPARQL   │
│  Cache   │<────────│  Cache  │<────────│  Endpoint  │
└──────────┘         └─────────┘         └────────────┘
   2 min TTL          Caffeine            No cache
   100 entries        Configurable
```

### Cache Key Generation

Queries are hashed to create cache keys:

```java
private String generateCacheKey(String query) {
    return String.valueOf(query.hashCode());
}
```

**Why hash?**
- Consistent key length
- Fast lookup
- Handles special characters

## Backend Implementation

### Caffeine Configuration

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("sparqlCache");
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }
    
    @Bean
    public Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
            .maximumSize(1000)              // Max 1000 entries
            .expireAfterWrite(10, TimeUnit.MINUTES)  // 10-minute TTL
            .recordStats();                 // Enable statistics
    }
}
```

### SparqlController

```java
@RestController
@RequestMapping("/api/sparql")
public class SparqlControllerImpl implements SparqlController {
    
    @Autowired
    private SparqlService sparqlService;
    
    @PostMapping("/query")
    public ResponseEntity<String> runSparql(
        @RequestParam("format") String format,
        @RequestParam("query") String query
    ) {
        String result = sparqlService.executeSparql(query);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/cacheinfo")
    public ResponseEntity<CacheInfo> cacheInfo() {
        CacheStats stats = sparqlService.getCacheStats();
        return ResponseEntity.ok(new CacheInfo(
            stats.estimatedSize(),
            stats.hitCount(),
            stats.missCount()
        ));
    }
}
```

### SparqlServiceImpl

```java
@Service
public class SparqlServiceImpl implements SparqlService {
    
    @Autowired
    private CacheManager cacheManager;
    
    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;
    
    @Cacheable(value = "sparqlCache", key = "#query.hashCode()")
    public String executeSparql(String query) {
        // Execute query against SPARQL endpoint
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("query", query);
        body.add("format", "json");
        
        HttpEntity<MultiValueMap<String, String>> request = 
            new HttpEntity<>(body, headers);
        
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(
            sparqlEndpoint,
            request,
            String.class
        );
        
        return response.getBody();
    }
    
    public CacheStats getCacheStats() {
        Cache cache = cacheManager.getCache("sparqlCache");
        CaffeineCache caffeineCache = (CaffeineCache) cache;
        return caffeineCache.getNativeCache().stats();
    }
}
```

## Cache Behavior

### Cache Hit

```
Frontend                Backend                 SPARQL
   |                       |                        |
   |--POST /sparql/query-->|                        |
   |  query: "SELECT..."   |                        |
   |                       |--hash(query)---------->|
   |                       |  key: 123456789        |
   |                       |                        |
   |                       |--cache.get(key)------->|
   |                       |<--cached result--------|
   |<--result (instant)----|                        |
```

### Cache Miss

```
Frontend                Backend                 SPARQL
   |                       |                        |
   |--POST /sparql/query-->|                        |
   |  query: "SELECT..."   |                        |
   |                       |--hash(query)---------->|
   |                       |  key: 987654321        |
   |                       |                        |
   |                       |--cache.get(key)------->|
   |                       |<--null (miss)----------|
   |                       |                        |
   |                       |--execute query-------->|
   |                       |                        |
   |                       |<--result (slow)--------|
   |                       |                        |
   |                       |--cache.put(key, result)|
   |<--result (slow)-------|                        |
```

## Cache Statistics

### Monitoring

```bash
curl http://localhost:8080/api/sparql/cacheinfo
```

Response:

```json
{
  "size": 42,
  "hitCount": 156,
  "missCount": 23,
  "hitRate": 0.871
}
```

**Metrics**:
- `size`: Current number of cached queries
- `hitCount`: Number of cache hits
- `missCount`: Number of cache misses
- `hitRate`: Percentage of requests served from cache

### Interpreting Stats

- **High hit rate (>80%)**: Cache is effective
- **Low hit rate (<50%)**: Consider increasing cache size or TTL
- **Size near max**: May need to increase `maximumSize`

## Configuration Options

### application.properties

```properties
# Cache type
spring.cache.type=caffeine

# Caffeine-specific settings
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=10m

# Optional: compress results to save memory
sparql.cache.compressResults=true
```

### Tuning Parameters

#### Maximum Size

```java
.maximumSize(1000)  // Max entries
```

**Trade-offs**:
- Larger: More memory, higher hit rate
- Smaller: Less memory, lower hit rate

**Recommendation**: Start with 1000, monitor hit rate

#### Expiration

```java
.expireAfterWrite(10, TimeUnit.MINUTES)
```

**Options**:
- `expireAfterWrite`: Fixed TTL from creation
- `expireAfterAccess`: TTL refreshes on each access
- `refreshAfterWrite`: Async refresh before expiration

**Recommendation**: Use `expireAfterWrite` for SPARQL (data changes infrequently)

#### Eviction Policy

Caffeine uses **Window TinyLFU**:

1. **Admission window**: Recently accessed entries
2. **Probation space**: Entries on trial
3. **Protected space**: Frequently accessed entries

Automatically evicts least-frequently-used entries when full.

## Advanced Features

### Compression

For large result sets, enable compression:

```java
@Cacheable(value = "sparqlCache", key = "#query.hashCode()")
public String executeSparql(String query) {
    String result = executeQuery(query);
    
    if (shouldCompress(result)) {
        return compress(result);
    }
    
    return result;
}

private boolean shouldCompress(String result) {
    return result.length() > 10_000;  // Compress if >10KB
}

private String compress(String data) {
    // Use GZIP compression
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    try (GZIPOutputStream gzos = new GZIPOutputStream(baos)) {
        gzos.write(data.getBytes(StandardCharsets.UTF_8));
    }
    return Base64.getEncoder().encodeToString(baos.toByteArray());
}
```

### Cache Warming

Pre-populate cache with common queries on startup:

```java
@Component
public class CacheWarmer implements ApplicationListener<ApplicationReadyEvent> {
    
    @Autowired
    private SparqlService sparqlService;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        List<String> commonQueries = loadCommonQueries();
        
        for (String query : commonQueries) {
            sparqlService.executeSparql(query);
        }
    }
}
```

### Manual Cache Invalidation

```java
@RestController
@RequestMapping("/api/cache")
public class CacheController {
    
    @Autowired
    private CacheManager cacheManager;
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCache() {
        Cache cache = cacheManager.getCache("sparqlCache");
        cache.clear();
        return ResponseEntity.ok().build();
    }
}
```

## Frontend Integration

### Using Backend Cache

```javascript
// In wikibase.service.js
async runSparqlQuery(query, minimize, useBackendCache) {
  if (useBackendCache) {
    // Use backend cache
    const response = await this.$axios.post('/api/sparql/query', {
      query,
      format: 'json'
    })
    return response.data
  } else {
    // Direct to SPARQL endpoint (no backend cache)
    const url = this.wbk.sparqlQuery(query)
    const response = await fetch(url)
    return response.json()
  }
}
```

### When to Use Backend Cache

**Use backend cache when**:
- Query is expensive (>1 second)
- Results change infrequently
- Shared across users (e.g., search results)

**Skip backend cache when**:
- Query is fast (<100ms)
- Results are user-specific
- Real-time data required

## Performance Impact

### Benchmarks

Without cache:

```
Average query time: 2.3s
P95 query time: 4.1s
Throughput: 10 req/s
```

With cache (80% hit rate):

```
Average query time: 0.4s
P95 query time: 2.5s
Throughput: 50 req/s
```

**5x improvement** in throughput!

### Memory Usage

Estimate memory per entry:

```
Query (avg): 500 bytes
Result (avg): 50 KB
Total per entry: ~50 KB

1000 entries = ~50 MB
```

Monitor with:

```bash
curl http://localhost:8080/actuator/metrics/cache.size
```

## Troubleshooting

### Cache Not Working

**Check configuration**:

```bash
curl http://localhost:8080/api/sparql/cacheinfo
```

If `hitCount` is always 0:
1. Verify `@EnableCaching` is present
2. Check `@Cacheable` annotation
3. Ensure method is public
4. Verify cache name matches

### Out of Memory

**Symptoms**:
- `OutOfMemoryError`
- Slow performance
- High GC activity

**Solutions**:
1. Reduce `maximumSize`
2. Enable compression
3. Decrease TTL
4. Increase heap size: `-Xmx2g`

### Stale Data

**Symptoms**:
- Old results returned
- Changes not reflected

**Solutions**:
1. Reduce TTL
2. Implement cache invalidation
3. Use `refreshAfterWrite`

## Next Steps

- [Architecture](architecture.md) - Understand overall structure
- [Security](security.md) - Learn about OAuth and proxying
