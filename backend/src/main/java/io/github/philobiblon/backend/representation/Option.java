package io.github.philobiblon.backend.representation;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Option option = (Option) o;

        if (!Objects.equals(text, option.text)) return false;

        Map<String, String> thisFiltered = filterOutProperty(value);
        Map<String, String> otherFiltered = filterOutProperty(option.value);

        return Objects.equals(thisFiltered, otherFiltered);
    }

    private Map<String, String> filterOutProperty(Map<String, String> map) {
        if (map == null) return Collections.emptyMap();

        return map.entrySet().stream()
                .filter(entry -> !"property".equals(entry.getKey()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                ));
    }

    @Override
    public int hashCode() {
        return Objects.hash(text, filterOutProperty(value));
    }
}

