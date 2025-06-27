package io.github.philobiblon.backend.representation;

import java.util.Map;

public class Option {
    private String text;
    private Map<String, String> value;

    public Option(String text, Map<String, String> value) {
        this.text = text;
        this.value = value;
    }

    public Map<String, String> getValue() {
        return value;
    }

    public String getText() {
        return text;
    }
}

