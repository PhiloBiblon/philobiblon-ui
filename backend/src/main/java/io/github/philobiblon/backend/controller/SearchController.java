package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
import io.github.philobiblon.backend.representation.RegisterFilterResponse;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@Validated
public interface SearchController {

    @PostMapping(consumes = "application/x-www-form-urlencoded")
    List<Option> search(@RequestParam String sparqlQuery, @RequestParam String q) throws IOException;

    @GetMapping("/quick")
    QuickSearchResponse quickSearch(@RequestParam @NotBlank String filterId,
                                     @RequestParam @NotBlank String q,
                                     @RequestParam @NotBlank String lang);

    /**
     * Registers (or updates) a QuickSearch filter's SPARQL load-query template.
     * Not exposed externally — see nginx.conf.template, called only from the deploy pipeline.
     */
    @PostMapping(path = "/quick/register", consumes = "application/x-www-form-urlencoded")
    RegisterFilterResponse registerQuickSearchFilter(@RequestParam @NotBlank String filterId,
                                                       @RequestParam @NotBlank String queryTemplate);
}
