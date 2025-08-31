package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.service.SearchService;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.RDFNode;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class SearchServiceImpl implements SearchService {

    private static final String LABEL_FIELD = "label";
    private static final int MAX_RESULTS = 100;

    @Override
    public List<Option> search(ResultSet resultSet, String q) {
        return convertToOptions(rankOptions(resultSet, q), resultSet);
    }

    private List<Option> convertToOptions(List<QuerySolution> solutions, ResultSet resultSet) {
        List<Option> options = new ArrayList<>();
        for(QuerySolution solution : solutions) {
            if (solution.contains(LABEL_FIELD)) {
                String label = solution.getLiteral(LABEL_FIELD).getString();
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
        return options;
    }

    private String extractQNumber(String uri) {
        return uri.substring(uri.lastIndexOf('/') + 1);
    }

    static String normalize(String input) {
        if (input == null) return null;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String withoutBrackets = withoutAccents.replaceAll("[\\(\\)\\[\\]]", "");
        return withoutBrackets.toLowerCase(Locale.ROOT);
    }

    private static List<QuerySolution> rankOptions(ResultSet resultSet, String query) {
        String normQuery = normalize(query);
        List<String> queryWords = Arrays.asList(normQuery.split("\\s+"));

        return StreamSupport
                .stream(Spliterators.spliteratorUnknownSize(resultSet, Spliterator.ORDERED), false)
                .filter(qs -> qs.contains(LABEL_FIELD))
                .map(qs -> new AbstractMap.SimpleEntry<>(qs, rank(qs, queryWords)))
                // Remove options with no matches
                .filter(entry -> entry.getValue() < Integer.MAX_VALUE)
                .sorted(Comparator.comparingInt(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .limit(MAX_RESULTS)
                .collect(Collectors.toList());
    }

    static int rank(QuerySolution querySolution, List<String> queryWords) {
        String label = querySolution.getLiteral(LABEL_FIELD).getString();
        String normText = normalize(label);

        List<Integer> wordPositions = new ArrayList<>();
        int totalMatches = 0;

        for (String word : queryWords) {
            int index = normText.indexOf(word);
            if (index >= 0) {
                wordPositions.add(index);
                totalMatches++;
            } else {
                return Integer.MAX_VALUE;
            }
        }

        boolean inOrder = true;
        for (int i = 1; i < wordPositions.size(); i++) {
            if (wordPositions.get(i) < wordPositions.get(i - 1)) {
                inOrder = false;
                break;
            }
        }

        int positionScore = wordPositions.stream().mapToInt(i -> i).sum();

        int orderPenalty = inOrder ? 0 : 200;

        // Reverse ranking: more matches → lower value; lower position → more relevant
        return 1000 - (totalMatches * 100) + positionScore + orderPenalty;
    }

}
