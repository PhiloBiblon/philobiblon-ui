package io.github.philobiblon.backend.controller.impl;

import io.github.philobiblon.backend.controller.ProxyController;
import io.github.philobiblon.backend.service.WikibaseOAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProxyControllerImpl implements ProxyController {

    @Autowired
    WikibaseOAuthService wikibaseOAuthService;

    @Override
    public String redirectToWikibase(HttpServletRequest request, String body) {
        return wikibaseOAuthService.redirect(request, body);
    }

}
