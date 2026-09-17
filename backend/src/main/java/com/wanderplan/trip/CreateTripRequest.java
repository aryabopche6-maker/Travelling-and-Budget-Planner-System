package com.wanderplan.trip;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class CreateTripRequest {
    @NotBlank(message = "Destination is required")
    private String destination;

    private String startingLocation;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Integer numberOfTravelers;

    @NotNull(message = "Budget is required")
    private Double budget;

    private String travelMode;
    private String travelPace;
    private String travelStyle;
    private List<String> interests;

    public CreateTripRequest() {}

    public CreateTripRequest(String destination, String startingLocation, LocalDate startDate, LocalDate endDate, Integer numberOfTravelers, Double budget, String travelMode, String travelPace, String travelStyle, List<String> interests) {
        this.destination = destination;
        this.startingLocation = startingLocation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfTravelers = numberOfTravelers;
        this.budget = budget;
        this.travelMode = travelMode;
        this.travelPace = travelPace;
        this.travelStyle = travelStyle;
        this.interests = interests;
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

    // Alias so frontend's "travelers" JSON field maps here
    @JsonProperty("travelers")
    public void setTravelers(Integer travelers) {
        this.numberOfTravelers = travelers;
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

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

}
