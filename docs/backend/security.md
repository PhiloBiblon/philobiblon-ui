# Security & OAuth

This document explains the security architecture, OAuth 1.0a implementation, and request proxying in the backend.

## OAuth 1.0a Flow

OAuth 1.0a is a three-legged authentication protocol. The backend acts as a **consumer** of the Wikibase OAuth provider.

### Why OAuth 1.0a?

- **No client secret exposure**: The frontend never sees the consumer secret
- **Signature-based**: Each request is cryptographically signed
- **Stateless**: No session cookies required
- **Wikibase standard**: MediaWiki/Wikibase uses OAuth 1.0a

### Flow Diagram

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│ Frontend│           │ Backend │           │ Wikibase │
└────┬────┘           └────┬────┘           └────┬─────┘
     │                     │                     │
     │ 1. GET /request-token                    │
     │────────────────────>│                     │
     │                     │ 2. getRequestToken()│
     │                     │────────────────────>│
     │                     │<────────────────────│
     │                     │   {token, secret}   │
     │<────────────────────│                     │
     │  {token, authUrl}   │                     │
     │                     │                     │
     │ 3. Redirect user to authUrl               │
     │──────────────────────────────────────────>│
     │                     │                     │
     │                     │  4. User approves   │
     │                     │                     │
     │<──────────────────────────────────────────│
     │  Redirect with oauth_verifier             │
     │                     │                     │
     │ 5. GET /access-token                      │
     │    + oauth_verifier │                     │
     │────────────────────>│                     │
     │                     │ 6. getAccessToken() │
     │                     │────────────────────>│
     │                     │<────────────────────│
     │<────────────────────│   {token, secret}   │
     │  {token, secret}    │                     │
     │                     │                     │
     │ 7. Store in Vuex    │                     │
     │                     │                     │
```

## Implementation Details

### Step 1: Request Token

**Frontend initiates**:

```javascript
const { token, authorizationUrl } = await $axios.$get('/api/oauth/request-token')
```

**Backend handles**:

```java
@GetMapping("/request-token")
public RequestToken getRequestToken() {
    OAuth1RequestToken requestToken = service.getRequestToken();
    
    // Store with 5-minute expiration
    requestTokens.put(requestToken.getToken(), requestToken);
    
    String authUrl = service.getAuthorizationUrl(requestToken);
    return new RequestToken(requestToken.getToken(), authUrl);
}
```

**ScribeJava under the hood**:

```java
OAuth10aService service = new ServiceBuilder(consumerKey)
    .apiSecret(consumerSecret)
    .callback(callbackUrl)
    .build(new MediaWikiApi(indexUrl, niceUrlBase));

OAuth1RequestToken requestToken = service.getRequestToken();
```

This makes a signed request to Wikibase:

```
POST https://wikibase.example.org/w/index.php?title=Special:OAuth/initiate
Authorization: OAuth oauth_consumer_key="...", oauth_signature="...", ...
```

### Step 2: User Authorization

Frontend redirects user to `authorizationUrl`:

```
https://wikibase.example.org/wiki/Special:OAuth/authorize?oauth_token=abc123...
```

User sees:
- Application name
- Requested permissions
- Approve/Deny buttons

### Step 3: Access Token Exchange

**Wikibase redirects back**:

```
http://localhost:3000/login?oauth_token=abc123&oauth_verifier=xyz789
```

**Frontend exchanges verifier**:

```javascript
const accessToken = await $axios.$get('/api/oauth/access-token', {
  params: {
    oauth_token: 'abc123',
    oauth_verifier: 'xyz789'
  }
})
```

**Backend exchanges**:

```java
@GetMapping("/access-token")
public AccessToken getAccessToken(
    @RequestParam("oauth_token") String token,
    @RequestParam("oauth_verifier") String verifier
) {
    OAuth1RequestToken requestToken = requestTokens.get(token);
    
    if (requestToken == null) {
        throw new RuntimeException("Request token not found or expired");
    }
    
    OAuth1AccessToken accessToken = service.getAccessToken(
        requestToken,
        verifier
    );
    
    // Clean up request token
    requestTokens.remove(token);
    
    // Store access token with 60-minute expiration
    accessTokens.put(accessToken.getToken(), accessToken);
    
    return new AccessToken(
        accessToken.getToken(),
        accessToken.getTokenSecret()
    );
}
```

## Token Management

### TimedMap Implementation

```java
public class TimedMap<K, V> {
    private final Map<K, Entry<V>> map = new ConcurrentHashMap<>();
    private final long ttl;
    private final TimeUnit unit;
    private final boolean refreshOnAccess;
    
    static class Entry<V> {
        final V value;
        long timestamp;
        
        Entry(V value) {
            this.value = value;
            this.timestamp = System.currentTimeMillis();
        }
    }
    
    public void put(K key, V value) {
        map.put(key, new Entry<>(value));
    }
    
    public V get(K key) {
        Entry<V> entry = map.get(key);
        
        if (entry == null) {
            return null;
        }
        
        long age = System.currentTimeMillis() - entry.timestamp;
        long maxAge = unit.toMillis(ttl);
        
        if (age > maxAge) {
            map.remove(key);
            return null;
        }
        
        if (refreshOnAccess) {
            entry.timestamp = System.currentTimeMillis();
        }
        
        return entry.value;
    }
}
```

### Token Expiration

```java
// Request tokens: 5 minutes, no refresh
private final TimedMap<String, OAuth1RequestToken> requestTokens = 
    new TimedMap<>(5, TimeUnit.MINUTES, false);

// Access tokens: 60 minutes, refresh on access
private final TimedMap<String, OAuth1AccessToken> accessTokens = 
    new TimedMap<>(60, TimeUnit.MINUTES, true);
```

**Why different TTLs?**
- **Request tokens**: Short-lived, one-time use
- **Access tokens**: Longer-lived, refreshed on each API call

## Request Proxying

### Why Proxy?

Direct calls from frontend to Wikibase fail because:

1. **CORS**: Wikibase doesn't allow cross-origin requests from arbitrary domains
2. **OAuth Signing**: Frontend can't sign requests (would expose consumer secret)
3. **Token Security**: Access token secret must stay server-side

### Proxy Implementation

```java
@PostMapping("/**")
public String proxy(
    HttpServletRequest request,
    @RequestBody String body
) {
    return oauthService.redirect(request, body);
}
```

**`redirect` method**:

```java
public String redirect(HttpServletRequest request, String body) {
    // 1. Build OAuth request
    OAuthRequest oAuthRequest = buildOAuthRequest(request, body);
    
    // 2. Get access token from Authorization header
    OAuth1AccessToken accessToken = getAccessTokenFromRequest(request);
    
    // 3. Sign request
    if (accessToken != null) {
        service.signRequest(accessToken, oAuthRequest);
    }
    
    // 4. Execute and return response
    Response response = service.execute(oAuthRequest);
    return response.getBody();
}
```

### Building the OAuth Request

```java
private OAuthRequest buildOAuthRequest(
    HttpServletRequest request,
    String body
) {
    // Reconstruct Wikibase URL
    URI uri = UriComponentsBuilder
        .fromUriString(wikibaseApiUrl)
        .query(request.getQueryString())
        .build(true)
        .toUri();
    
    // Determine HTTP method
    Verb verb = getVerbFromRequest(request);
    
    // Create OAuth request
    OAuthRequest oAuthRequest = new OAuthRequest(verb, uri.toString());
    
    // Add body parameters for POST/PUT
    if (verb == Verb.POST || verb == Verb.PUT) {
        addParamsFromBody(oAuthRequest, body);
    }
    
    return oAuthRequest;
}
```

### Extracting Access Token

Frontend sends token in Authorization header:

```javascript
headers: {
  Authorization: 'OAuth oauth_token="abc123", oauth_token_secret="xyz789"'
}
```

Backend extracts:

```java
private OAuth1AccessToken getAccessTokenFromRequest(
    HttpServletRequest request
) {
    String authHeader = request.getHeader("authorization");
    
    if (authHeader != null) {
        Matcher matcher = PATTERN_OAUTH_TOKEN.matcher(authHeader);
        if (matcher.find()) {
            String token = matcher.group(1);
            OAuth1AccessToken accessToken = accessTokens.get(token);
            
            if (accessToken == null) {
                throw new WikibaseException("Session expired");
            }
            
            return accessToken;
        }
    }
    
    // GET requests don't need auth
    if (request.getMethod().equals("GET")) {
        return null;
    }
    
    throw new WikibaseException("Session expired");
}
```

### Request Signing

ScribeJava signs the request:

```java
service.signRequest(accessToken, oAuthRequest);
```

This adds OAuth parameters to the Authorization header:

```
Authorization: OAuth 
  oauth_consumer_key="consumer123",
  oauth_token="abc123",
  oauth_signature_method="HMAC-SHA1",
  oauth_timestamp="1640000000",
  oauth_nonce="random123",
  oauth_version="1.0",
  oauth_signature="base64signature=="
```

**Signature calculation**:

```
signature = HMAC-SHA1(
  base_string,
  consumer_secret + "&" + token_secret
)

base_string = 
  HTTP_METHOD + "&" +
  URL_ENCODED(request_url) + "&" +
  URL_ENCODED(sorted_parameters)
```

## Security Best Practices

### 1. Never Expose Consumer Secret

```java
// ✅ Good: Secret stays in backend
@Value("${oauth.consumerSecret}")
private String consumerSecret;

// ❌ Bad: Never send to frontend
// Never include in /api/config response
```

### 2. Validate Token Expiration

```java
OAuth1AccessToken accessToken = accessTokens.get(token);

if (accessToken == null) {
    throw new WikibaseException("Session expired");
}
```

### 3. Use HTTPS in Production

```properties
# application-prod.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_PASSWORD}
```

### 4. Limit CORS Origins

```java
@CrossOrigin(origins = "${allowed.origins}")
```

Never use `*` in production:

```properties
# ❌ Bad
allowed.origins=*

# ✅ Good
allowed.origins=https://philobiblon.example.org
```

### 5. Sanitize Request Parameters

```java
private void addParamsFromBody(OAuthRequest oAuthRequest, String body) {
    Matcher matcher = PATTERN_PARAMS.matcher(body);
    
    while (matcher.find()) {
        String param = matcher.group(1);
        
        // Prevent parameter pollution
        if (!param.equals("format") && !param.equals("action")) {
            String value = decodeURLValue(matcher.group(2));
            oAuthRequest.addBodyParameter(param, value);
        }
    }
}
```

## Error Handling

### Session Expiration

```java
@ExceptionHandler(WikibaseException.class)
public ResponseEntity<ErrorResponse> handleWikibaseException(
    WikibaseException ex
) {
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(new ErrorResponse(ex.getMessage()));
}
```

Frontend handles:

```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.commit('auth/logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### Invalid OAuth Signature

If signature is invalid, Wikibase returns:

```json
{
  "error": {
    "code": "mwoauth-invalid-authorization",
    "info": "The authorization headers in your request are not valid"
  }
}
```

Backend propagates this to frontend.

## Testing OAuth Flow

### Manual Testing

1. **Get request token**:

```bash
curl http://localhost:8080/api/oauth/request-token
```

2. **Visit authorization URL** in browser

3. **Extract verifier** from callback URL

4. **Exchange for access token**:

```bash
curl "http://localhost:8080/api/oauth/access-token?oauth_token=TOKEN&oauth_verifier=VERIFIER"
```

5. **Make authenticated request**:

```bash
curl -X POST http://localhost:8080/w/api.php?action=query&meta=userinfo \
  -H "Authorization: OAuth oauth_token=\"TOKEN\", oauth_token_secret=\"SECRET\""
```

### Unit Testing

```java
@Test
public void testGetRequestToken() {
    RequestToken token = oauthService.getRequestToken();
    
    assertNotNull(token.token());
    assertTrue(token.authorizationUrl().contains("Special:OAuth/authorize"));
}

@Test
public void testAccessTokenExpiration() throws InterruptedException {
    OAuth1AccessToken token = new OAuth1AccessToken("token", "secret");
    accessTokens.put("key", token);
    
    // Wait for expiration
    Thread.sleep(61 * 60 * 1000);
    
    assertNull(accessTokens.get("key"));
}
```

## Next Steps

- [Caching](caching.md) - Understand SPARQL caching
- [Architecture](architecture.md) - Review overall structure
