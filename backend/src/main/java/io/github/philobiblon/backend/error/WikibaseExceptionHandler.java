package io.github.philobiblon.backend.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class WikibaseExceptionHandler {

    @ExceptionHandler({WikibaseException.class})
    public ResponseEntity<Object> handleWikibaseException(WikibaseException ex, WebRequest request) {
        WikibaseError wikibaseError = new WikibaseError(ex.getCode(), ex.getMessage());
        return new ResponseEntity<>(wikibaseError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Spring's default error page hides the real exception message from the response body
    // (returns a bare {"error":"Internal Server Error"} with no detail). The frontend's
    // wikibase-edit client only understands the {"error":{"code","info"}} shape, so an
    // unrecognized failure here (e.g. an IOException talking to the real Wikibase instance)
    // used to surface as an undiagnosable "undefined: undefined" / generic error client-side.
    // Reusing that shape here, with the real exception message as "info", makes the actual
    // cause visible without needing server log access. See #393.
    @ExceptionHandler({Exception.class})
    public ResponseEntity<Object> handleUnexpected(Exception ex, WebRequest request) {
        WikibaseError wikibaseError = new WikibaseError("internal-error", ex.getMessage());
        return new ResponseEntity<>(wikibaseError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
