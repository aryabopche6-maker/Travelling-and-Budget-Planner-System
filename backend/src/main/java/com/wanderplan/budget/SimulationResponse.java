package com.wanderplan.budget;


import java.util.List;

public class SimulationResponse {
    private Double currentTotal;
    private Double newTotal;
    private Double difference;
    private Double savings;
    private Double additionalCost;
    private List<String> recommendations;

    public SimulationResponse() {}

    public SimulationResponse(Double currentTotal, Double newTotal, Double difference, Double savings, Double additionalCost, List<String> recommendations) {
        this.currentTotal = currentTotal;
        this.newTotal = newTotal;
        this.difference = difference;
        this.savings = savings;
        this.additionalCost = additionalCost;
        this.recommendations = recommendations;
    }

    public Double getCurrentTotal() {
        return currentTotal;
    }

    public void setCurrentTotal(Double currentTotal) {
        this.currentTotal = currentTotal;
    }

    public Double getNewTotal() {
        return newTotal;
    }

    public void setNewTotal(Double newTotal) {
        this.newTotal = newTotal;
    }

    public Double getDifference() {
        return difference;
    }

    public void setDifference(Double difference) {
        this.difference = difference;
    }

    public Double getSavings() {
        return savings;
    }

    public void setSavings(Double savings) {
        this.savings = savings;
    }

    public Double getAdditionalCost() {
        return additionalCost;
    }

    public void setAdditionalCost(Double additionalCost) {
        this.additionalCost = additionalCost;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public static SimulationResponseBuilder builder() {
        return new SimulationResponseBuilder();
    }

    public static class SimulationResponseBuilder {
        private Double currentTotal;
        private Double newTotal;
        private Double difference;
        private Double savings;
        private Double additionalCost;
        private List<String> recommendations;

        public SimulationResponseBuilder() {}

        public SimulationResponseBuilder currentTotal(Double currentTotal) {
            this.currentTotal = currentTotal;
            return this;
        }

        public SimulationResponseBuilder newTotal(Double newTotal) {
            this.newTotal = newTotal;
            return this;
        }

        public SimulationResponseBuilder difference(Double difference) {
            this.difference = difference;
            return this;
        }

        public SimulationResponseBuilder savings(Double savings) {
            this.savings = savings;
            return this;
        }

        public SimulationResponseBuilder additionalCost(Double additionalCost) {
            this.additionalCost = additionalCost;
            return this;
        }

        public SimulationResponseBuilder recommendations(List<String> recommendations) {
            this.recommendations = recommendations;
            return this;
        }

        public SimulationResponse build() {
            return new SimulationResponse(this.currentTotal, this.newTotal, this.difference, this.savings, this.additionalCost, this.recommendations);
        }
    }

}
