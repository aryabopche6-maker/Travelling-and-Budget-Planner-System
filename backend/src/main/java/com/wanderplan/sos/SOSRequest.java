package com.wanderplan.sos;

import jakarta.validation.constraints.NotBlank;

public class SOSRequest {
    @NotBlank(message = "Emergency type is required")
    private String emergencyType;
    private Double latitude;
    private Double longitude;

    public SOSRequest() {}

    public SOSRequest(String emergencyType, Double latitude, Double longitude) {
        this.emergencyType = emergencyType;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
        this.emergencyType = emergencyType;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

}
