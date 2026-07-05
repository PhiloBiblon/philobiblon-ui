package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
import io.github.philobiblon.backend.representation.SearchResponse;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@Validated
public interface SearchController {

    /** Legacy contract: bare array, blocks on a cold query. Kept for cached SPAs; removed once v=2 is everywhere. */
    @PostMapping(params = "!v", consumes = "application/x-www-form-urlencoded")
    List<Option> search(@RequestParam String sparqlQuery, @RequestParam String q) throws IOException;

    /** Async contract: never blocks; a cold query answers immediately with indexLoading=true. */
    @PostMapping(params = "v=2", consumes = "application/x-www-form-urlencoded")
    SearchResponse searchV2(@RequestParam String sparqlQuery,
                            @RequestParam String q,
                            @RequestParam(required = false) String searchVars,
                            @RequestParam(required = false) String hint,
                            @RequestParam(required = false) Integer limit);

    @GetMapping("/quick")
    QuickSearchResponse quickSearch(@RequestParam @NotBlank String q, @RequestParam @NotBlank String lang);

    @GetMapping("/cache/status")
    CacheStatusResponse cacheStatus();
}
