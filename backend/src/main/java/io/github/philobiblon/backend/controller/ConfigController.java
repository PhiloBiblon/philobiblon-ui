package io.github.philobiblon.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(value = {"/api/config"})
public interface ConfigController {

    @GetMapping
    Map<String, String> getConfigValues();
}
