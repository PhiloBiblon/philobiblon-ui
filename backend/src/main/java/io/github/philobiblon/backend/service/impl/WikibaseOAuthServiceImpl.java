package io.github.philobiblon.backend.service.impl;

import com.github.scribejava.apis.MediaWikiApi;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.model.OAuth1AccessToken;
import com.github.scribejava.core.model.OAuth1RequestToken;
import com.github.scribejava.core.model.OAuthRequest;
import com.github.scribejava.core.model.Response;
import com.github.scribejava.core.model.Verb;
import com.github.scribejava.core.oauth.OAuth10aService;
import io.github.philobiblon.backend.helper.TimedMap;
import io.github.philobiblon.backend.representation.AccessToken;
import io.github.philobiblon.backend.representation.RequestToken;
import io.github.philobiblon.backend.service.WikibaseOAuthService;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringReader;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class WikibaseOAuthServiceImpl implements WikibaseOAuthService {

    private OAuth10aService service;
    private TimedMap<String, OAuth1RequestToken> requestTokens = new TimedMap<>(5, TimeUnit.MINUTES);
    private String wikibaseApiUrl;

    @Autowired
    public WikibaseOAuthServiceImpl(@Value("${oauth.consumerKey}") String oauthConsumerKey,
                                    @Value("${oauth.consumerSecret}") String oauthConsumerSecret,
                                    @Value("${oauth.callbackUrl}") String oauthCallbackUrl,
                                    @Value("${oauth.wikibaseIndexUrl}") String wikibaseIndexUrl,
                                    @Value("${oauth.wikibaseNiceUrlBase}") String wikibaseNiceUrlBase,
                                    @Value("${oauth.wikibaseApiUrl}") String wikibaseApiUrl) {
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
        OAuth1AccessToken accessToken = new OAuth1AccessToken(token, tokenSecret);
        OAuthRequest request = new OAuthRequest(Verb.GET, String.format("%s?action=query&meta=userinfo&format=json", wikibaseApiUrl));
        service.signRequest(accessToken, request);
        try {
            Response response = service.execute(request);
            JsonObject jsonObject = Json.createReader(new StringReader(response.getBody())).readObject();
            return jsonObject.getJsonObject("query").getJsonObject("userinfo").getString("name");
        } catch (IOException | InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }
}
