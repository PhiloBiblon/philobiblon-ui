package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.Option;
import org.apache.jena.query.ResultSetRewindable;

import java.util.List;

public interface SearchService {

    List<Option> search(ResultSetRewindable resultSet, String q);
}
