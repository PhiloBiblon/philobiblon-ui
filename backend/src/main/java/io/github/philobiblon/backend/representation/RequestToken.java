package io.github.philobiblon.backend.representation;

public class RequestToken {

    private String token;
    private String authUrl;

    public RequestToken(String token, String authUrl) {
        this.token = token;
        this.authUrl = authUrl;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAuthUrl() {
        return authUrl;
    }

    public void setAuthUrl(String authUrl) {
        this.authUrl = authUrl;
    }
}
