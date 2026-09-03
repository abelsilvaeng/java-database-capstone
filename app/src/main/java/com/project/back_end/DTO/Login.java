package com.project.back_end.DTO;

import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Credentials submitted at login. The identifier is the email for a doctor or a
 * patient and the username for an admin, which is why the field is not called
 * "email". The aliases keep the older payload shapes working: a client that still
 * posts {"email": ...} or {"username": ...} binds to the same field.
 */
public class Login {

    @JsonAlias({"email", "username"})
    private String identifier;

    private String password;

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
