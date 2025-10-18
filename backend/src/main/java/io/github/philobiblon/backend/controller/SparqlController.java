package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.CacheInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/sparql")
@CrossOrigin(origins = "${allowed.origins}")
public interface SparqlController {

    @PostMapping(value = "/query", consumes = "application/x-www-form-urlencoded")
    ResponseEntity<String> runSparql(@RequestParam("format") String format, @RequestParam("query") String query) throws IOException;

    @GetMapping(value = "/cacheinfo")
    ResponseEntity<CacheInfo> cacheInfo();
}
