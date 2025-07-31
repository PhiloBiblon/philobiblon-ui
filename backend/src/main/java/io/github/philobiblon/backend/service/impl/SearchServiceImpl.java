package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.service.SearchService;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetRewindable;
import org.apache.jena.rdf.model.RDFNode;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.*;

@Component
public class SearchServiceImpl implements SearchService {

    private static final String LABEL_FIELD = "label";
    private static final int MAX_RESULTS = 100;

    @Override
    public List<Option> search(ResultSetRewindable resultSet, String q) {
        List<Option> options = new ArrayList<>();
        int counter = 0;

        resultSet.reset();
        while (resultSet.hasNext() && counter <= MAX_RESULTS) {
            QuerySolution solution = resultSet.next();

            if (solution.contains(LABEL_FIELD)) {
                String label = solution.getLiteral(LABEL_FIELD).getString();

                if (containsIgnoreCaseAndAccents(label, q)) {
                    counter++;
                    Map<String, String> valueMap = new HashMap<>();

                    for (Iterator<String> varNames = resultSet.getResultVars().iterator(); varNames.hasNext(); ) {
                        String varName = varNames.next();
                        if (solution.contains(varName)) {
                            RDFNode node = solution.get(varName);
                            if (node.isLiteral()) {
                                valueMap.put(varName, node.asLiteral().getString());
                            } else if (node.isResource()) {
                                String uri = node.asResource().getURI();
                                valueMap.put(varName, extractQNumber(uri));
                            }
                        }
                    }

                    Option option = new Option(label, valueMap);
                    if (!options.contains(option)) {
                        options.add(option);
                    }
                }
            }
        }

        return options;
    }

    private String extractQNumber(String uri) {
        return uri.substring(uri.lastIndexOf('/') + 1);
    }

    private static boolean containsIgnoreCaseAndAccents(String s1, String s2) {
        String norm1 = normalize(s1);
        String norm2 = normalize(s2);
        return norm1.contains(norm2);
    }

    private static String normalize(String input) {
        if (input == null) return null;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return withoutAccents.toLowerCase(Locale.ROOT);
    }

}
