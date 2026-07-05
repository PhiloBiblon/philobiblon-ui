package io.github.philobiblon.backend.service.impl;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Text normalization and ranking shared by the SPARQL cache search and the quick search:
 * a row matches when every query word appears in its (normalized) search text, ranked by
 * match count, word positions/order and text length.
 */
public final class SearchServiceImpl {

    private SearchServiceImpl() {
    }

    public static String normalize(String input) {
        if (input == null) return null;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String withoutBrackets = withoutAccents.replaceAll("[\\(\\)\\[\\]]", "");
        return withoutBrackets.toLowerCase(Locale.ROOT);
    }

    public static int rank(String label, List<String> queryWords) {
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

        int lengthPenalty = normText.length();

        // Reverse ranking: more matches → lower value; lower position → more relevant
        return 1000 - (totalMatches * 100) + (positionScore * 50) + lengthPenalty + orderPenalty;
    }

}
