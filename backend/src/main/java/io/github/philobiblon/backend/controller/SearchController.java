package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.SearchResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public interface SearchController {

    /** Async contract: never blocks; a cold query answers immediately with indexLoading=true. */
    @PostMapping(params = "v=2", consumes = "application/x-www-form-urlencoded")
    SearchResponse searchV2(@RequestParam String sparqlQuery,
                            @RequestParam String q,
                            @RequestParam(required = false) String searchVars,
                            @RequestParam(required = false) String hint,
                            @RequestParam(required = false) Integer limit,
                            @RequestParam(required = false) String lang,
                            @RequestParam(required = false) String group,
                            @RequestParam(required = false) String bitagapGroup);

    @GetMapping("/cache/status")
    CacheStatusResponse cacheStatus();
}
