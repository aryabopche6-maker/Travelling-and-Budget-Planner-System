package com.wanderplan.sos;

import com.wanderplan.trip.Trip;
import com.wanderplan.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_alerts")
public class SOSAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String emergencyType; // Medical, Security, Lost, Vehicle Breakdown

    private Double latitude;

    private Double longitude;

        private String status = "ACTIVE"; // ACTIVE, SAFE, RESOLVED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdTime;

    @UpdateTimestamp
    private LocalDateTime updatedTime;

    public SOSAlert() {}

    public SOSAlert(Long id, Trip trip, User user, String emergencyType, Double latitude, Double longitude, String status, LocalDateTime createdTime, LocalDateTime updatedTime) {
        this.id = id;
        this.trip = trip;
        this.user = user;
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

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public static SOSAlertBuilder builder() {
        return new SOSAlertBuilder();
    }

    public static class SOSAlertBuilder {
        private Long id;
        private Trip trip;
        private User user;
        private String emergencyType;
        private Double latitude;
        private Double longitude;
        private String status;
        private LocalDateTime createdTime;
        private LocalDateTime updatedTime;

        public SOSAlertBuilder() {}

        public SOSAlertBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SOSAlertBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public SOSAlertBuilder user(User user) {
            this.user = user;
            return this;
        }

        public SOSAlertBuilder emergencyType(String emergencyType) {
            this.emergencyType = emergencyType;
            return this;
        }

        public SOSAlertBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public SOSAlertBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public SOSAlertBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SOSAlertBuilder createdTime(LocalDateTime createdTime) {
            this.createdTime = createdTime;
            return this;
        }

        public SOSAlertBuilder updatedTime(LocalDateTime updatedTime) {
            this.updatedTime = updatedTime;
            return this;
        }

        public SOSAlert build() {
            return new SOSAlert(this.id, this.trip, this.user, this.emergencyType, this.latitude, this.longitude, this.status, this.createdTime, this.updatedTime);
        }
    }

}
