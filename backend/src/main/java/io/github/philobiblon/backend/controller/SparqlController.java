package io.github.philobiblon.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sparql")
public interface SparqlController {

    /**
     * Pass-through to the SPARQL endpoint, so browsers never talk to it directly (its reputation
     * check redirects some clients to a challenge page without CORS headers).
     * Answers the endpoint's SPARQL JSON results.
     */
    @PostMapping(consumes = "application/x-www-form-urlencoded", produces = "application/sparql-results+json")
    String query(@RequestParam String query);
}
