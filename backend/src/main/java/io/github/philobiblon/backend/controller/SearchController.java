package io.github.philobiblon.backend.controller;

import io.github.philobiblon.backend.representation.Option;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "${allowed.origins}")
public interface SearchController {

    @PostMapping(consumes = "application/x-www-form-urlencoded")
    List<Option> search(@RequestParam String sparqlQuery, @RequestParam String q);
}
