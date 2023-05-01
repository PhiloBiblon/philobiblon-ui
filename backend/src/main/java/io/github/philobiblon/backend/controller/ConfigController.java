package io.github.philobiblon.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(value = {"/api/config"})
@CrossOrigin(origins = "${allowed.origins}")
public interface ConfigController {

    @GetMapping
    Map<String, String> getConfigValues();
}
