package com.wanderplan.invitation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SendInvitationRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    public SendInvitationRequest() {}

    public SendInvitationRequest(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
