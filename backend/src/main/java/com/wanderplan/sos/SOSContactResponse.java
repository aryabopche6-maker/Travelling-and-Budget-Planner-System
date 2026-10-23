package com.wanderplan.sos;

public class SOSContactResponse {
    private final Long id;
    private final String name;
    private final String phone;
    private final String relationship;

    public SOSContactResponse(Long id, String name, String phone, String relationship) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.relationship = relationship;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getRelationship() {
        return relationship;
    }
}
