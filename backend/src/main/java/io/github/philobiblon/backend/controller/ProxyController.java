package io.github.philobiblon.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public interface ProxyController {

    @RequestMapping("/w/**")
    String redirectToWikibase(HttpServletRequest request, @RequestBody(required = false) String body);
}
