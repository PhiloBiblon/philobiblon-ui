package io.github.philobiblon.backend.error;

public class WikibaseError {

    public static class ErrorDetail {
        private final String code;
        private final String info;

        public ErrorDetail(String code, String info) {
            this.code = code;
            this.info = info;
        }

        public String getCode() {
            return code;
        }

        public String getInfo() {
            return info;
        }
    }

    private final ErrorDetail error;

    public WikibaseError(String code, String info) {
        this.error = new ErrorDetail(code, info);
    }

    public ErrorDetail getError() {
        return error;
    }
}
