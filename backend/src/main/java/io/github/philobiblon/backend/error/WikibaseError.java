package io.github.philobiblon.backend.error;

public class WikibaseError {

    private String code;
    private String info;
    private int success;

    public WikibaseError(String code, String info) {
        this.code = code;
        this.info = info;
        this.success = 0;
    }

    public String getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }

    public int getSuccess() {
        return success;
    }
}
