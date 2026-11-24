package io.github.philobiblon.backend.helper;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.SortCondition;
import org.apache.jena.query.Syntax;
import org.apache.jena.shared.PrefixMapping;
import org.apache.jena.sparql.algebra.Algebra;
import org.apache.jena.sparql.algebra.Op;
import org.apache.jena.sparql.algebra.OpVisitorBase;
import org.apache.jena.sparql.algebra.op.OpGroup;
import org.apache.jena.sparql.algebra.op.OpOrder;
import org.apache.jena.sparql.algebra.op.OpService;
import org.apache.jena.sparql.algebra.walker.Walker;
import org.apache.jena.sparql.expr.Expr;
import org.apache.jena.sparql.expr.ExprAggregator;
import org.apache.jena.sparql.expr.ExprList;
import org.apache.jena.sparql.expr.ExprVisitorBase;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Structural checks on client-supplied SPARQL before it reaches the upstream endpoint, shared by
 * {@code /api/sparql} and {@code /api/search}: only SELECT/ASK, and no federated {@code SERVICE}
 * other than {@code wikibase:label}. The query is parsed exactly as received (no prefix is added upstream; Blazegraph's built-in prefixes are pre-declared only for parsing).
 */
@Component
public class SparqlQueryValidator {

    /**
     * Prefixes Blazegraph/WDQS declares on its own, so frontend queries may use them without a PREFIX line.
     * They are only pre-declared for parsing here; the query sent upstream is never modified.
     */
    static final PrefixMapping BUILTIN_PREFIXES = PrefixMapping.Factory.create()
            .setNsPrefix("wikibase", "http://wikiba.se/ontology#")
            .setNsPrefix("bd", "http://www.bigdata.com/rdf#")
            .setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#")
            .setNsPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
            .setNsPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#")
            .setNsPrefix("owl", "http://www.w3.org/2002/07/owl#")
            .setNsPrefix("schema", "http://schema.org/")
            .setNsPrefix("skos", "http://www.w3.org/2004/02/skos/core#");

    static final String ALLOWED_SERVICE_IRI = "http://wikiba.se/ontology#label";

    /**
     * Throws a 400 {@link ResponseStatusException} if the query is not acceptable; otherwise returns the
     * parsed query, so callers that need it do not parse it again.
     */
    public Query validate(String sparqlQuery) {
        Query query;
        try {
            query = new Query();
            // a copy: the parser adds the query's own PREFIX lines to the mapping, and the shared one is locked
            query.setPrefixMapping(PrefixMapping.Factory.create().setNsPrefixes(BUILTIN_PREFIXES));
            QueryFactory.parse(query, sparqlQuery, null, Syntax.syntaxSPARQL_11);
        } catch (QueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SPARQL query: " + e.getMessage(), e);
        }
        if (!query.isSelectType() && !query.isAskType()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only SELECT and ASK queries are allowed");
        }
        rejectForeignServices(query);
        return query;
    }

    /**
     * Walks the compiled algebra rather than the syntax tree: the algebra walker also descends into
     * subqueries, nested SERVICE blocks and EXISTS / NOT EXISTS patterns inside FILTER, BIND and SELECT
     * expressions, which ElementWalker does not reach. ORDER BY and GROUP BY / aggregate expressions are
     * not walked by Walker, so they are walked explicitly.
     */
    private static void rejectForeignServices(Query query) {
        new ServiceChecker().check(Algebra.compile(query));
    }

    private static final class ServiceChecker extends OpVisitorBase {

        private final ExprVisitorBase exprVisitor = new ExprVisitorBase();

        void check(Op op) {
            Walker.walk(op, this, exprVisitor);
        }

        private void check(Expr expr) {
            Walker.walk(expr, this, exprVisitor);
        }

        @Override
        public void visit(OpService service) {
            Node node = service.getService();
            if (node == null || !node.isURI() || !ALLOWED_SERVICE_IRI.equals(node.getURI())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE " + node + " is not allowed");
            }
        }

        @Override
        public void visit(OpOrder order) {
            for (SortCondition condition : order.getConditions()) {
                check(condition.getExpression());
            }
        }

        @Override
        public void visit(OpGroup group) {
            group.getGroupVars().getExprs().values().forEach(this::check);
            for (ExprAggregator aggregator : group.getAggregators()) {
                ExprList exprs = aggregator.getAggregator().getExprList();
                if (exprs != null) {
                    exprs.forEach(this::check);
                }
            }
        }
    }
}
