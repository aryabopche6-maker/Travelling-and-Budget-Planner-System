package com.wanderplan.sos;


import java.time.LocalDateTime;

public class SOSResponse {
    private Long id;
    private Long tripId;
    private Long userId;
    private String userName;
    private String userPhone;
    private String emergencyType;
    private Double latitude;
    private Double longitude;
    private String status; // ACTIVE, SAFE, RESOLVED
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    public SOSResponse() {}

    public SOSResponse(Long id, Long tripId, Long userId, String userName, String userPhone, String emergencyType, Double latitude, Double longitude, String status, LocalDateTime createdTime, LocalDateTime updatedTime) {
        this.id = id;
        this.tripId = tripId;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.emergencyType = emergencyType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.createdTime = createdTime;
        this.updatedTime = updatedTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }

    public LocalDateTime getUpdatedTime() {
        return updatedTime;
    }

    public void setUpdatedTime(LocalDateTime updatedTime) {
        this.updatedTime = updatedTime;
    }

    public static SOSResponseBuilder builder() {
        return new SOSResponseBuilder();
    }

    public static class SOSResponseBuilder {
        private Long id;
        private Long tripId;
        private Long userId;
        private String userName;
        private String userPhone;
        private String emergencyType;
        private Double latitude;
        private Double longitude;
        private String status;
        private LocalDateTime createdTime;
        private LocalDateTime updatedTime;

        public SOSResponseBuilder() {}

        public SOSResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SOSResponseBuilder tripId(Long tripId) {
            this.tripId = tripId;
            return this;
        }

        public SOSResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public SOSResponseBuilder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public SOSResponseBuilder userPhone(String userPhone) {
            this.userPhone = userPhone;
            return this;
        }

        public SOSResponseBuilder emergencyType(String emergencyType) {
            this.emergencyType = emergencyType;
            return this;
        }

        public SOSResponseBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public SOSResponseBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public SOSResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SOSResponseBuilder createdTime(LocalDateTime createdTime) {
            this.createdTime = createdTime;
            return this;
        }

        public SOSResponseBuilder updatedTime(LocalDateTime updatedTime) {
            this.updatedTime = updatedTime;
            return this;
        }

        public SOSResponse build() {
            return new SOSResponse(this.id, this.tripId, this.userId, this.userName, this.userPhone, this.emergencyType, this.latitude, this.longitude, this.status, this.createdTime, this.updatedTime);
        }
    }

}
