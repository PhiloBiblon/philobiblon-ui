package io.github.philobiblon.backend.representation;

import java.util.Map;
import java.util.Objects;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Option option = (Option) o;
        return Objects.equals(text, option.text) && Objects.equals(value, option.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(text, value);
    }
}

