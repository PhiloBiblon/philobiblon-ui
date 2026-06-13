package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.QuickSearchResponse;
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
    QuickSearchResponse quickSearch(@RequestParam @NotBlank String q, @RequestParam @NotBlank String lang);
}
