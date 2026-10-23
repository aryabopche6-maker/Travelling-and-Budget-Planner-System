package com.wanderplan.sos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SOSContactRequest {

    @NotBlank(message = "Contact name is required")
    private String name;

    @NotBlank(message = "Contact phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone number must use international format, for example +14155552671")
    private String phone;

    @Size(max = 40, message = "Relationship must be 40 characters or fewer")
    private String relationship;

    public SOSContactRequest() {}

    public SOSContactRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public SOSContactRequest(String name, String phone, String relationship) {
        this.name = name;
        this.phone = phone;
        this.relationship = relationship;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }
}
