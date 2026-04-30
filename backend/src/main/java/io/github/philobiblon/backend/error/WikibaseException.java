package io.github.philobiblon.backend.error;

public class WikibaseException extends RuntimeException {

    private final String code;

    public WikibaseException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
