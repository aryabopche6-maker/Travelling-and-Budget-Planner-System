package com.wanderplan.trip;

import com.wanderplan.member.MemberResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TripResponse {
    private Long id;
    private String destination;
    private String startingLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfTravelers;
    private Double budget;
    private Double spent;
    private String travelMode;
    private String travelPace;
    private String travelStyle;
    private String status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MemberResponse> members;
    private List<String> interests;

    public TripResponse() {}

    public TripResponse(Long id, String destination, String startingLocation, LocalDate startDate, LocalDate endDate, Integer numberOfTravelers, Double budget, Double spent, String travelMode, String travelPace, String travelStyle, String status, Long createdBy, LocalDateTime createdAt, LocalDateTime updatedAt, List<MemberResponse> members, List<String> interests) {
        this.id = id;
        this.destination = destination;
        this.startingLocation = startingLocation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfTravelers = numberOfTravelers;
        this.budget = budget;
        this.spent = spent;
        this.travelMode = travelMode;
        this.travelPace = travelPace;
        this.travelStyle = travelStyle;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.members = members;
        this.interests = interests;
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

    public Double getSpent() {
        return spent;
    }

    public void setSpent(Double spent) {
        this.spent = spent;
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

    public List<MemberResponse> getMembers() {
        return members;
    }

    public void setMembers(List<MemberResponse> members) {
        this.members = members;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public static TripResponseBuilder builder() {
        return new TripResponseBuilder();
    }

    public static class TripResponseBuilder {
        private Long id;
        private String destination;
        private String startingLocation;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer numberOfTravelers;
        private Double budget;
        private Double spent;
        private String travelMode;
        private String travelPace;
        private String travelStyle;
        private String status;
        private Long createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<MemberResponse> members;
        private List<String> interests;

        public TripResponseBuilder() {}

        public TripResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TripResponseBuilder destination(String destination) {
            this.destination = destination;
            return this;
        }

        public TripResponseBuilder startingLocation(String startingLocation) {
            this.startingLocation = startingLocation;
            return this;
        }

        public TripResponseBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public TripResponseBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public TripResponseBuilder numberOfTravelers(Integer numberOfTravelers) {
            this.numberOfTravelers = numberOfTravelers;
            return this;
        }

        public TripResponseBuilder budget(Double budget) {
            this.budget = budget;
            return this;
        }

        public TripResponseBuilder spent(Double spent) {
            this.spent = spent;
            return this;
        }

        public TripResponseBuilder travelMode(String travelMode) {
            this.travelMode = travelMode;
            return this;
        }

        public TripResponseBuilder travelPace(String travelPace) {
            this.travelPace = travelPace;
            return this;
        }

        public TripResponseBuilder travelStyle(String travelStyle) {
            this.travelStyle = travelStyle;
            return this;
        }

        public TripResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TripResponseBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public TripResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TripResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public TripResponseBuilder members(List<MemberResponse> members) {
            this.members = members;
            return this;
        }

        public TripResponseBuilder interests(List<String> interests) {
            this.interests = interests;
            return this;
        }

        public TripResponse build() {
            return new TripResponse(this.id, this.destination, this.startingLocation, this.startDate, this.endDate, this.numberOfTravelers, this.budget, this.spent, this.travelMode, this.travelPace, this.travelStyle, this.status, this.createdBy, this.createdAt, this.updatedAt, this.members, this.interests);
        }
    }

}
