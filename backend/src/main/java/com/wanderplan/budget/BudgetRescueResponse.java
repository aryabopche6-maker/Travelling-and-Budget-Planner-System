package com.wanderplan.budget;


import java.util.List;

public class BudgetRescueResponse {
    private Double currentSpending;
    private Double remainingBudget;
    private Double expectedRemainingExpenses;
    private Double predictedOverage;
    private String alertMessage;
    private List<AlternativeResponse> rescueOptions;

    public BudgetRescueResponse() {}

    public BudgetRescueResponse(Double currentSpending, Double remainingBudget, Double expectedRemainingExpenses, Double predictedOverage, String alertMessage, List<AlternativeResponse> rescueOptions) {
        this.currentSpending = currentSpending;
        this.remainingBudget = remainingBudget;
        this.expectedRemainingExpenses = expectedRemainingExpenses;
        this.predictedOverage = predictedOverage;
        this.alertMessage = alertMessage;
        this.rescueOptions = rescueOptions;
    }

    public Double getCurrentSpending() {
        return currentSpending;
    }

    public void setCurrentSpending(Double currentSpending) {
        this.currentSpending = currentSpending;
    }

    public Double getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(Double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public Double getExpectedRemainingExpenses() {
        return expectedRemainingExpenses;
    }

    public void setExpectedRemainingExpenses(Double expectedRemainingExpenses) {
        this.expectedRemainingExpenses = expectedRemainingExpenses;
    }

    public Double getPredictedOverage() {
        return predictedOverage;
    }

    public void setPredictedOverage(Double predictedOverage) {
        this.predictedOverage = predictedOverage;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public List<AlternativeResponse> getRescueOptions() {
        return rescueOptions;
    }

    public void setRescueOptions(List<AlternativeResponse> rescueOptions) {
        this.rescueOptions = rescueOptions;
    }

    public static BudgetRescueResponseBuilder builder() {
        return new BudgetRescueResponseBuilder();
    }

    public static class BudgetRescueResponseBuilder {
        private Double currentSpending;
        private Double remainingBudget;
        private Double expectedRemainingExpenses;
        private Double predictedOverage;
        private String alertMessage;
        private List<AlternativeResponse> rescueOptions;

        public BudgetRescueResponseBuilder() {}

        public BudgetRescueResponseBuilder currentSpending(Double currentSpending) {
            this.currentSpending = currentSpending;
            return this;
        }

        public BudgetRescueResponseBuilder remainingBudget(Double remainingBudget) {
            this.remainingBudget = remainingBudget;
            return this;
        }

        public BudgetRescueResponseBuilder expectedRemainingExpenses(Double expectedRemainingExpenses) {
            this.expectedRemainingExpenses = expectedRemainingExpenses;
            return this;
        }

        public BudgetRescueResponseBuilder predictedOverage(Double predictedOverage) {
            this.predictedOverage = predictedOverage;
            return this;
        }

        public BudgetRescueResponseBuilder alertMessage(String alertMessage) {
            this.alertMessage = alertMessage;
            return this;
        }

        public BudgetRescueResponseBuilder rescueOptions(List<AlternativeResponse> rescueOptions) {
            this.rescueOptions = rescueOptions;
            return this;
        }

        public BudgetRescueResponse build() {
            return new BudgetRescueResponse(this.currentSpending, this.remainingBudget, this.expectedRemainingExpenses, this.predictedOverage, this.alertMessage, this.rescueOptions);
        }
    }

}
