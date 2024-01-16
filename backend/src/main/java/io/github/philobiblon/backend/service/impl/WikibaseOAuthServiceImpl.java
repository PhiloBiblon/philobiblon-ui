package io.github.philobiblon.backend.service.impl;

import com.github.scribejava.apis.MediaWikiApi;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.model.OAuth1AccessToken;
import com.github.scribejava.core.model.OAuth1RequestToken;
import com.github.scribejava.core.model.OAuthRequest;
import com.github.scribejava.core.model.Response;
import com.github.scribejava.core.model.Verb;
import com.github.scribejava.core.oauth.OAuth10aService;
import io.github.philobiblon.backend.error.WikibaseException;
import io.github.philobiblon.backend.helper.TimedMap;
import io.github.philobiblon.backend.representation.AccessToken;
import io.github.philobiblon.backend.representation.RequestToken;
import io.github.philobiblon.backend.service.WikibaseOAuthService;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WikibaseOAuthServiceImpl implements WikibaseOAuthService {

    private final Pattern PATTERN_OAUTH_TOKEN = Pattern.compile("oauth_token=\"(.*?)\"");
    private final Pattern PATTERN_PARAMS = Pattern.compile("([^=&]*)=([^&]*)");

    private final TimedMap<String, OAuth1RequestToken> requestTokens = new TimedMap<>(5, TimeUnit.MINUTES);
    private final TimedMap<String, OAuth1AccessToken> accessTokens = new TimedMap<>(60, TimeUnit.MINUTES, true);

    private final OAuth10aService service;
    private final String wikibaseApiUrl;

    @Autowired
    public WikibaseOAuthServiceImpl(@Value("${oauth.consumerKey}") String oauthConsumerKey,
                                    @Value("${oauth.consumerSecret}") String oauthConsumerSecret,
                                    @Value("${oauth.callbackUrl}") String oauthCallbackUrl,
                                    @Value("${wikibase.apiUrl}") String wikibaseApiUrl,
                                    @Value("${wikibase.indexUrl}") String wikibaseIndexUrl,
                                    @Value("${wikibase.niceUrlBase}") String wikibaseNiceUrlBase) {
        this.service = new ServiceBuilder(oauthConsumerKey)
                .apiSecret(oauthConsumerSecret)
                .callback(oauthCallbackUrl)
                .build(new MediaWikiApi(wikibaseIndexUrl, wikibaseNiceUrlBase));
        this.wikibaseApiUrl = wikibaseApiUrl;
    }

    @Override
    public RequestToken getRequestToken() {
        try {
            OAuth1RequestToken requestToken = service.getRequestToken();
            requestTokens.put(requestToken.getToken(), requestToken);
            return new RequestToken(requestToken.getToken(), service.getAuthorizationUrl(requestToken));
        } catch (IOException | InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public AccessToken getAccessToken(String token, String oauthVerifier) {
        OAuth1RequestToken requestToken = requestTokens.get(token);
        if (requestToken != null) {
            try {
                OAuth1AccessToken accessToken = service.getAccessToken(requestToken, oauthVerifier);
                requestTokens.remove(token);
                accessTokens.put(accessToken.getToken(), accessToken);
                return new AccessToken(accessToken.getToken(), accessToken.getTokenSecret());
            } catch (IOException | InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        } else {
            throw new RuntimeException("Request token not found.");
        }
    }

    @Override
    public String getUsername(String token, String tokenSecret) {
        String USER_ENDPOINT = "%s?action=query&meta=userinfo&format=json";

        OAuth1AccessToken accessToken = new OAuth1AccessToken(token, tokenSecret);
        OAuthRequest request = new OAuthRequest(Verb.GET, String.format(USER_ENDPOINT, wikibaseApiUrl));
        service.signRequest(accessToken, request);
        try {
            Response response = service.execute(request);
            JsonObject jsonObject = Json.createReader(new StringReader(response.getBody())).readObject();
            return jsonObject.getJsonObject("query").getJsonObject("userinfo").getString("name");
        } catch (IOException | InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }


    @Override
    public String redirect(HttpServletRequest request, String body) {
        OAuthRequest oAuthRequest = buildOAuthRequest(request, body);
        OAuth1AccessToken accessToken = getAccessTokenFromRequest(request);
        if (accessToken != null) {
            service.signRequest(accessToken, oAuthRequest);
        }
        try {
            Response oAuthResponse = service.execute(oAuthRequest);
            return oAuthResponse.getBody();
        } catch (IOException | InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private OAuthRequest buildOAuthRequest(HttpServletRequest request, String body) {
        URI uri = UriComponentsBuilder.fromUriString(wikibaseApiUrl)
                .query(request.getQueryString())
                .build(true).toUri();
        Verb verb = getVerbFromRequest(request);
        OAuthRequest oAuthRequest = new OAuthRequest(verb, uri.toString());
        if (verb == Verb.PUT || verb == Verb.POST) {
            addParamsFromBody(oAuthRequest, body);
        }
        return oAuthRequest;
    }

    private void addParamsFromBody(OAuthRequest oAuthRequest, String body) {
        Matcher matcher = PATTERN_PARAMS.matcher(body);
        while (matcher.find()) {
            String param = matcher.group(1);
            // We need to remove params that already exist in the query string
            if (!"format".equals(param) && !"action".equals(param)) {
                String value = decodeURLValue(matcher.group(2));
                oAuthRequest.addBodyParameter(param, value);
            }
        }
    }

    private static String decodeURLValue(String value) {
        return java.net.URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private Verb getVerbFromRequest(HttpServletRequest request) {
        return switch (request.getMethod()) {
            case "GET" -> Verb.GET;
            case "PUT" -> Verb.PUT;
            case "POST" -> Verb.POST;
            case "DELETE" -> Verb.DELETE;
            default -> throw new IllegalStateException("Unexpected value: " + request.getMethod());
        };
    }

    private OAuth1AccessToken getAccessTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("authorization");
        if (authHeader != null) {
            Matcher matcher = PATTERN_OAUTH_TOKEN.matcher(authHeader);
            if (matcher.find()) {
                String token = matcher.group(1);
                return accessTokens.get(token);
            }
        } else if (getVerbFromRequest(request) == Verb.GET) {
            return null;
        }
        throw new WikibaseException("Session expired.");
    }
}
