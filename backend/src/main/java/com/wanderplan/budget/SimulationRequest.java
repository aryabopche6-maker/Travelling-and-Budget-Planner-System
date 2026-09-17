package com.wanderplan.budget;


public class SimulationRequest {
    private Double newBudget;
    private Integer newDays;
    private Integer newTravelers;
    private String newHotelTier;
    private String newTransportMode;

    public SimulationRequest() {}

    public SimulationRequest(Double newBudget, Integer newDays, Integer newTravelers, String newHotelTier, String newTransportMode) {
        this.newBudget = newBudget;
        this.newDays = newDays;
        this.newTravelers = newTravelers;
        this.newHotelTier = newHotelTier;
        this.newTransportMode = newTransportMode;
    }

    public Double getNewBudget() {
        return newBudget;
    }

    public void setNewBudget(Double newBudget) {
        this.newBudget = newBudget;
    }

    public Integer getNewDays() {
        return newDays;
    }

    public void setNewDays(Integer newDays) {
        this.newDays = newDays;
    }

    public Integer getNewTravelers() {
        return newTravelers;
    }

    public void setNewTravelers(Integer newTravelers) {
        this.newTravelers = newTravelers;
    }

    public String getNewHotelTier() {
        return newHotelTier;
    }

    public void setNewHotelTier(String newHotelTier) {
        this.newHotelTier = newHotelTier;
    }

    public String getNewTransportMode() {
        return newTransportMode;
    }

    public void setNewTransportMode(String newTransportMode) {
        this.newTransportMode = newTransportMode;
    }

}
