package io.github.philobiblon.backend.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class WikibaseExceptionHandler {

    @ExceptionHandler({WikibaseException.class})
    public ResponseEntity<Object> handleAll(WikibaseException ex, WebRequest request) {
        WikibaseError wikibaseError = new WikibaseError("Error", ex.getMessage());
        return new ResponseEntity<>(wikibaseError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
