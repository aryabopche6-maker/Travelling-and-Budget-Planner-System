package com.wanderplan.surpriseme;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class SurpriseMeRequest {
    private String startingLocation;
    @NotNull(message = "Budget is required")
    private Double budget;
    private Integer days;
    private Integer travelers;
    private List<String> interests;
    private String travelPace;

    public SurpriseMeRequest() {}

    public SurpriseMeRequest(String startingLocation, Double budget, Integer days, Integer travelers, List<String> interests, String travelPace) {
        this.startingLocation = startingLocation;
        this.budget = budget;
        this.days = days;
        this.travelers = travelers;
        this.interests = interests;
        this.travelPace = travelPace;
    }

    public String getStartingLocation() {
        return startingLocation;
    }

    public void setStartingLocation(String startingLocation) {
        this.startingLocation = startingLocation;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public Integer getTravelers() {
        return travelers;
    }

    public void setTravelers(Integer travelers) {
        this.travelers = travelers;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getTravelPace() {
        return travelPace;
    }

    public void setTravelPace(String travelPace) {
        this.travelPace = travelPace;
    }

}
