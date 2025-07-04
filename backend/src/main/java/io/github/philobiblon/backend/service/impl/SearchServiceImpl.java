package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.service.SearchService;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetRewindable;
import org.apache.jena.rdf.model.RDFNode;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SearchServiceImpl implements SearchService {

    private static final String LABEL_FIELD = "label";

    @Override
    public List<Option> search(ResultSetRewindable resultSet, String q) {
        List<Option> options = new ArrayList<>();

        resultSet.reset();
        while (resultSet.hasNext()) {
            QuerySolution solution = resultSet.next();

            if (solution.contains(LABEL_FIELD)) {
                String label = solution.getLiteral(LABEL_FIELD).getString();

                if (label.toLowerCase().contains(q.toLowerCase())) {
                    Map<String, String> valueMap = new HashMap<>();

                    for (Iterator<String> varNames = resultSet.getResultVars().iterator(); varNames.hasNext(); ) {
                        String varName = varNames.next();
                        if (solution.contains(varName)) {
                            RDFNode node = solution.get(varName);
                            if (node.isLiteral()) {
                                valueMap.put(varName, node.asLiteral().getString());
                            } else if (node.isResource()) {
                                String uri = node.asResource().getURI();
                                // Si vols extreure el Qnumber o l’últim fragment de la URI
                                String qNumber = uri.substring(uri.lastIndexOf('/') + 1);
                                valueMap.put(varName, qNumber);
                            }
                        }
                    }

                    Option option = new Option(label, valueMap);
                    options.add(option);
                }
            }
        }

        return options;
    }
}
