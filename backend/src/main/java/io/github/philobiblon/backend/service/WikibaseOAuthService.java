package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.AccessToken;
import io.github.philobiblon.backend.representation.RequestToken;

public interface WikibaseOAuthService {

    RequestToken getRequestToken();

    AccessToken getAccessToken(String token, String oauthVerifier);

    String getUsername(String token, String tokenSecret);
}
