package io.github.philobiblon.backend.helper;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.SortCondition;
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
 * other than {@code wikibase:label}. The query is parsed exactly as received (no prefix is added).
 */
@Component
public class SparqlQueryValidator {

    static final String ALLOWED_SERVICE_IRI = "http://wikiba.se/ontology#label";

    /** Throws a 400 {@link ResponseStatusException} if the query is not acceptable. */
    public void validate(String sparqlQuery) {
        Query query;
        try {
            query = QueryFactory.create(sparqlQuery);
        } catch (QueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SPARQL query: " + e.getMessage(), e);
        }
        if (!query.isSelectType() && !query.isAskType()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only SELECT and ASK queries are allowed");
        }
        rejectForeignServices(query);
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
