package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.OAuthController;
import io.github.philobiblon.backend.representation.AccessToken;
import io.github.philobiblon.backend.representation.RequestToken;
import io.github.philobiblon.backend.service.WikibaseOAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class OAuthControllerImpl implements OAuthController {

    private WikibaseOAuthService wikibaseOAuthService;

    @Autowired
    public OAuthControllerImpl(WikibaseOAuthService wikibaseOAuthService) {
        this.wikibaseOAuthService = wikibaseOAuthService;
    }

    @Override
    public RequestToken getRequestToken() {
        return wikibaseOAuthService.getRequestToken();
    }

    @Override
    public AccessToken getAccessToken(String token, String oauthVerifier) {
        return wikibaseOAuthService.getAccessToken(token, oauthVerifier);
    }

    @Override
    public String getUsername(String token, String tokenSecret) {
        return wikibaseOAuthService.getUsername(token, tokenSecret);
    }
}
