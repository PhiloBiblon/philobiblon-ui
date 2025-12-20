# Backend Architecture

This document explains the architecture and structure of the PhiloBiblon UI backend application.

## Technology Stack

- **Spring Boot 3.0.5**: Application framework
- **Java 17**: Programming language
- **ScribeJava 8.3.3**: OAuth 1.0a library
- **Caffeine 3.1.6**: High-performance caching
- **Apache Jena 5.4.0**: SPARQL processing (if needed)

## Application Structure

```
backend/
└── src/main/java/io/github/philobiblon/backend/
    ├── Application.java          # Main entry point
    ├── config/                    # Configuration classes
    ├── controller/                # REST controllers
    │   ├── ConfigController.java
    │   ├── OAuthController.java
    │   ├── ProxyController.java
    │   ├── SearchController.java
    │   ├── SparqlController.java
    │   └── impl/                  # Controller implementations
    ├── service/                   # Business logic
    │   ├── WikibaseOAuthService.java
    │   ├── SparqlService.java
    │   ├── SearchService.java
    │   └── impl/                  # Service implementations
    ├── helper/                    # Utility classes
    │   └── TimedMap.java          # Token expiration map
    ├── representation/            # DTOs
    │   ├── AccessToken.java
    │   ├── RequestToken.java
    │   └── CacheInfo.java
    └── error/                     # Exception handling
        └── WikibaseException.java
```

## Design Patterns

### 1. Controller-Service Pattern

Controllers handle HTTP requests, services contain business logic.

```java
@RestController
@RequestMapping("/api/oauth")
public class OAuthControllerImpl implements OAuthController {
    
    @Autowired
    private WikibaseOAuthService oauthService;
    
    @GetMapping("/request-token")
    public RequestToken getRequestToken() {
        return oauthService.getRequestToken();
    }
}
```

### 2. Interface-Implementation Separation

Controllers and services are defined as interfaces, implemented separately.

**Why?**
- Easier testing (mock interfaces)
- Clear contracts
- Flexibility to swap implementations

```java
// Interface
public interface WikibaseOAuthService {
    RequestToken getRequestToken();
    AccessToken getAccessToken(String token, String verifier);
}

// Implementation
@Service
public class WikibaseOAuthServiceImpl implements WikibaseOAuthService {
    // Implementation details
}
```

### 3. Dependency Injection

Spring manages object creation and wiring.

```java
@Service
public class WikibaseOAuthServiceImpl {
    
    private final OAuth10aService service;
    
    @Autowired
    public WikibaseOAuthServiceImpl(
        @Value("${oauth.consumerKey}") String consumerKey,
        @Value("${oauth.consumerSecret}") String consumerSecret
    ) {
        this.service = new ServiceBuilder(consumerKey)
            .apiSecret(consumerSecret)
            .build(new MediaWikiApi(...));
    }
}
```

## Key Components

### Application.java

The main entry point:

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`@SpringBootApplication` combines:
- `@Configuration`: Defines beans
- `@EnableAutoConfiguration`: Auto-configures based on classpath
- `@ComponentScan`: Scans for components

### Controllers

#### ConfigController

Exposes backend configuration to the frontend.

```java
@GetMapping("/")
public Map<String, String> getConfig() {
    return Map.of(
        "wikibaseBaseUrl", wikibaseBaseUrl,
        "wikibaseApiUrl", wikibaseApiUrl,
        "sparqlEndpoint", sparqlEndpoint,
        // ...
    );
}
```

**Why?** Frontend needs to know Wikibase URLs for direct API calls (read operations).

#### OAuthController

Handles OAuth 1.0a flow.

**Endpoints**:
- `GET /api/oauth/request-token`: Initiates login
- `GET /api/oauth/access-token`: Exchanges verifier for token
- `GET /api/oauth/username`: Retrieves username

#### SparqlController

Proxies SPARQL queries with caching.

```java
@PostMapping("/query")
public ResponseEntity<String> runSparql(
    @RequestParam("format") String format,
    @RequestParam("query") String query
) {
    String cacheKey = generateCacheKey(query);
    
    // Check cache
    String cached = cache.getIfPresent(cacheKey);
    if (cached != null) {
        return ResponseEntity.ok(cached);
    }
    
    // Execute query
    String result = executeSparqlQuery(query);
    
    // Cache result
    cache.put(cacheKey, result);
    
    return ResponseEntity.ok(result);
}
```

#### ProxyController

Proxies all other Wikibase API requests, signing them with OAuth.

```java
@RequestMapping("/**")
public String proxy(HttpServletRequest request, @RequestBody String body) {
    return oauthService.redirect(request, body);
}
```

### Services

#### WikibaseOAuthServiceImpl

Core OAuth logic using ScribeJava.

**Key Features**:
1. **Token Management**: Stores request and access tokens in `TimedMap`
2. **Request Signing**: Signs outgoing requests with OAuth signature
3. **Proxy Logic**: Forwards requests to Wikibase

**Token Storage**:

```java
private final TimedMap<String, OAuth1RequestToken> requestTokens = 
    new TimedMap<>(5, TimeUnit.MINUTES);
    
private final TimedMap<String, OAuth1AccessToken> accessTokens = 
    new TimedMap<>(60, TimeUnit.MINUTES, true);
```

- Request tokens: 5-minute TTL
- Access tokens: 60-minute TTL with auto-refresh on access

#### SparqlServiceImpl

Executes SPARQL queries and manages caching.

```java
@Cacheable("sparqlCache")
public String executeSparql(String query) {
    // Execute query against SPARQL endpoint
    // Return JSON results
}
```

Uses Spring's `@Cacheable` annotation with Caffeine cache.

### Helper Classes

#### TimedMap

A custom map with automatic expiration.

```java
public class TimedMap<K, V> {
    private final Map<K, Entry<V>> map = new ConcurrentHashMap<>();
    private final long ttl;
    private final TimeUnit unit;
    
    public void put(K key, V value) {
        map.put(key, new Entry<>(value, System.currentTimeMillis()));
    }
    
    public V get(K key) {
        Entry<V> entry = map.get(key);
        if (entry != null && !entry.isExpired(ttl, unit)) {
            return entry.value;
        }
        map.remove(key);
        return null;
    }
}
```

**Why not use Caffeine?** `TimedMap` is used for OAuth tokens which need custom expiration logic and manual cleanup.

### DTOs (Data Transfer Objects)

#### RequestToken

```java
public record RequestToken(String token, String authorizationUrl) {}
```

Returned by `/api/oauth/request-token`.

#### AccessToken

```java
public record AccessToken(String token, String tokenSecret) {}
```

Returned by `/api/oauth/access-token`.

#### CacheInfo

```java
public record CacheInfo(long size, long hitCount, long missCount) {}
```

Returned by `/api/sparql/cacheinfo`.

## Configuration

### application.properties

Maps environment variables to Spring properties:

```properties
# OAuth
oauth.consumerKey=${OAUTH_CONSUMER_KEY}
oauth.consumerSecret=${OAUTH_CONSUMER_SECRET}
oauth.callbackUrl=${OAUTH_CALLBACK_URL}

# Wikibase
wikibase.baseUrl=${WIKIBASE_BASE_URL}
wikibase.apiUrl=${WIKIBASE_API_URL}

# SPARQL
sparql.endpoint=${SPARQL_ENDPOINT}

# CORS
allowed.origins=${ALLOWED_ORIGINS}

# Caching
spring.cache.type=caffeine
```

### CORS Configuration

```java
@CrossOrigin(origins = "${allowed.origins}")
```

Applied to all controllers to allow frontend access.

## Request Flow

### 1. OAuth Login

```
Frontend                Backend                 Wikibase
   |                       |                        |
   |--GET /request-token-->|                        |
   |                       |--getRequestToken()---->|
   |                       |<----requestToken-------|
   |<--{token, authUrl}----|                        |
   |                       |                        |
   |--redirect to authUrl-------------------------->|
   |                       |                        |
   |<--redirect with verifier-----------------------|
   |                       |                        |
   |--GET /access-token--->|                        |
   |   + verifier          |--getAccessToken()----->|
   |                       |<----accessToken--------|
   |<--{token, secret}-----|                        |
```

### 2. Proxied Edit Request

```
Frontend                Backend                 Wikibase
   |                       |                        |
   |--POST /w/api.php----->|                        |
   |  + OAuth header       |                        |
   |                       |--extract token-------->|
   |                       |  from header           |
   |                       |                        |
   |                       |--sign request--------->|
   |                       |  with token+secret     |
   |                       |                        |
   |                       |--forward request------>|
   |                       |                        |
   |                       |<--response-------------|
   |<--response------------|                        |
```

### 3. Cached SPARQL Query

```
Frontend                Backend                 SPARQL Endpoint
   |                       |                        |
   |--POST /sparql/query-->|                        |
   |                       |--check cache---------->|
   |                       |  (Caffeine)            |
   |                       |                        |
   |                       |--[cache miss]--------->|
   |                       |                        |
   |                       |--execute query-------->|
   |                       |                        |
   |                       |<--results--------------|
   |                       |                        |
   |                       |--store in cache------->|
   |<--results-------------|                        |
```

## Error Handling

### Global Exception Handler

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(WikibaseException.class)
    public ResponseEntity<ErrorResponse> handleWikibaseException(
        WikibaseException ex
    ) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

### Custom Exceptions

```java
public class WikibaseException extends RuntimeException {
    public WikibaseException(String message) {
        super(message);
    }
}
```

Thrown when:
- OAuth token is missing or expired
- Wikibase API returns an error

## Logging

Configured in `application.properties`:

```properties
logging.level.io.github.philobiblon=INFO
logging.level.org.springframework.web=DEBUG
```

**Log Levels**:
- `TRACE`: Very detailed
- `DEBUG`: Detailed
- `INFO`: General information
- `WARN`: Warnings
- `ERROR`: Errors

## Performance Considerations

### 1. Caching

- **SPARQL queries**: Caffeine cache (in-memory)
- **OAuth tokens**: TimedMap (in-memory with expiration)

### 2. Connection Pooling

Spring Boot auto-configures connection pooling for HTTP clients.

### 3. Async Processing

For long-running operations, use `@Async`:

```java
@Async
public CompletableFuture<String> longRunningTask() {
    // ...
}
```

## Next Steps

- [Security](security.md) - Deep dive into OAuth and proxying
- [Caching](caching.md) - Understand caching strategies
- [Setup](setup.md) - Get the backend running locally
