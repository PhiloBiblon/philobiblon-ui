package io.github.philobiblon.backend.representation;

import io.github.philobiblon.backend.service.QuickSearchService.RegistrationResult;

public class RegisterFilterResponse {

    private boolean registered;
    private RegistrationResult result;

    public RegisterFilterResponse(boolean registered, RegistrationResult result) {
        this.registered = registered;
        this.result = result;
    }

    public boolean isRegistered() {
        return registered;
    }

    public RegistrationResult getResult() {
        return result;
    }
}
