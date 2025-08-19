package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.Option;
import org.apache.jena.query.ResultSet;

import java.util.List;

public interface SearchService {

    List<Option> search(ResultSet resultSet, String q);
}
