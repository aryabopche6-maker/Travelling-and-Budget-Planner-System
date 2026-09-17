package com.wanderplan.trip;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String destination;

    private String startingLocation;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer numberOfTravelers;

    private Double budget;

    private String travelMode; // flight, train, car, bus

    private String travelPace; // Relaxed, Balanced, Packed

    private String travelStyle; // Budget, Moderate, Premium

        private String status = "planning"; // planning, upcoming, completed

    private Long createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Trip() {}

    public Trip(Long id, String destination, String startingLocation, LocalDate startDate, LocalDate endDate, Integer numberOfTravelers, Double budget, String travelMode, String travelPace, String travelStyle, String status, Long createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.destination = destination;
        this.startingLocation = startingLocation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfTravelers = numberOfTravelers;
        this.budget = budget;
        this.travelMode = travelMode;
        this.travelPace = travelPace;
        this.travelStyle = travelStyle;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getStartingLocation() {
        return startingLocation;
    }

    public void setStartingLocation(String startingLocation) {
        this.startingLocation = startingLocation;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getNumberOfTravelers() {
        return numberOfTravelers;
    }

    public void setNumberOfTravelers(Integer numberOfTravelers) {
        this.numberOfTravelers = numberOfTravelers;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getTravelMode() {
        return travelMode;
    }

    public void setTravelMode(String travelMode) {
        this.travelMode = travelMode;
    }

    public String getTravelPace() {
        return travelPace;
    }

    public void setTravelPace(String travelPace) {
        this.travelPace = travelPace;
    }

    public String getTravelStyle() {
        return travelStyle;
    }

    public void setTravelStyle(String travelStyle) {
        this.travelStyle = travelStyle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static TripBuilder builder() {
        return new TripBuilder();
    }

    public static class TripBuilder {
        private Long id;
        private String destination;
        private String startingLocation;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer numberOfTravelers;
        private Double budget;
        private String travelMode;
        private String travelPace;
        private String travelStyle;
        private String status;
        private Long createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public TripBuilder() {}

        public TripBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TripBuilder destination(String destination) {
            this.destination = destination;
            return this;
        }

        public TripBuilder startingLocation(String startingLocation) {
            this.startingLocation = startingLocation;
            return this;
        }

        public TripBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public TripBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public TripBuilder numberOfTravelers(Integer numberOfTravelers) {
            this.numberOfTravelers = numberOfTravelers;
            return this;
        }

        public TripBuilder budget(Double budget) {
            this.budget = budget;
            return this;
        }

        public TripBuilder travelMode(String travelMode) {
            this.travelMode = travelMode;
            return this;
        }

        public TripBuilder travelPace(String travelPace) {
            this.travelPace = travelPace;
            return this;
        }

        public TripBuilder travelStyle(String travelStyle) {
            this.travelStyle = travelStyle;
            return this;
        }

        public TripBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TripBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public TripBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TripBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Trip build() {
            return new Trip(this.id, this.destination, this.startingLocation, this.startDate, this.endDate, this.numberOfTravelers, this.budget, this.travelMode, this.travelPace, this.travelStyle, this.status, this.createdBy, this.createdAt, this.updatedAt);
        }
    }

}
