package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.AccessToken;
import io.github.philobiblon.backend.representation.RequestToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = {"/api/oauth"})
@CrossOrigin(origins = "${allowed.origins}")
public interface OAuthController {

    @GetMapping(value = "/request-token")
    RequestToken getRequestToken();

    @GetMapping(value = "/access-token")
    AccessToken getAccessToken(@RequestParam("oauth_token") String token, @RequestParam("oauth_verifier") String oauthVerifier);

    @GetMapping(value = "/username")
    String getUsername(@RequestParam("oauth_token") String token, @RequestParam("oauth_tokensecret") String tokenSecret);
}
