package com.wanderplan.sos;

public class SOSDeliveryResult {
    private final String name;
    private final String phone;
    private final String status;
    private final String message;

    public SOSDeliveryResult(String name, String phone, String status, String message) {
        this.name = name;
        this.phone = phone;
        this.status = status;
        this.message = message;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
