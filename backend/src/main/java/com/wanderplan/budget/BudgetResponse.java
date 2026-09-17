package com.wanderplan.budget;


import java.util.List;

public class BudgetResponse {
    private Double totalBudget;
    private Double transport;
    private Double hotel;
    private Double food;
    private Double activities;
    private Double hiddenCosts;
    private Double spent;
    private Double remainingBudget;
    private Double budgetPercentage;
    private String status; // WITHIN_BUDGET, BUDGET_TIGHT, OVER_BUDGET
    private List<HiddenCostResponse> hiddenCostItems;

    public BudgetResponse() {}

    public BudgetResponse(Double totalBudget, Double transport, Double hotel, Double food, Double activities, Double hiddenCosts, Double spent, Double remainingBudget, Double budgetPercentage, String status, List<HiddenCostResponse> hiddenCostItems) {
        this.totalBudget = totalBudget;
        this.transport = transport;
        this.hotel = hotel;
        this.food = food;
        this.activities = activities;
        this.hiddenCosts = hiddenCosts;
        this.spent = spent;
        this.remainingBudget = remainingBudget;
        this.budgetPercentage = budgetPercentage;
        this.status = status;
        this.hiddenCostItems = hiddenCostItems;
    }

    public Double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(Double totalBudget) {
        this.totalBudget = totalBudget;
    }

    public Double getTransport() {
        return transport;
    }

    public void setTransport(Double transport) {
        this.transport = transport;
    }

    public Double getHotel() {
        return hotel;
    }

    public void setHotel(Double hotel) {
        this.hotel = hotel;
    }

    public Double getFood() {
        return food;
    }

    public void setFood(Double food) {
        this.food = food;
    }

    public Double getActivities() {
        return activities;
    }

    public void setActivities(Double activities) {
        this.activities = activities;
    }

    public Double getHiddenCosts() {
        return hiddenCosts;
    }

    public void setHiddenCosts(Double hiddenCosts) {
        this.hiddenCosts = hiddenCosts;
    }

    public Double getSpent() {
        return spent;
    }

    public void setSpent(Double spent) {
        this.spent = spent;
    }

    public Double getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(Double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public Double getBudgetPercentage() {
        return budgetPercentage;
    }

    public void setBudgetPercentage(Double budgetPercentage) {
        this.budgetPercentage = budgetPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<HiddenCostResponse> getHiddenCostItems() {
        return hiddenCostItems;
    }

    public void setHiddenCostItems(List<HiddenCostResponse> hiddenCostItems) {
        this.hiddenCostItems = hiddenCostItems;
    }

    public static BudgetResponseBuilder builder() {
        return new BudgetResponseBuilder();
    }

    public static class BudgetResponseBuilder {
        private Double totalBudget;
        private Double transport;
        private Double hotel;
        private Double food;
        private Double activities;
        private Double hiddenCosts;
        private Double spent;
        private Double remainingBudget;
        private Double budgetPercentage;
        private String status;
        private List<HiddenCostResponse> hiddenCostItems;

        public BudgetResponseBuilder() {}

        public BudgetResponseBuilder totalBudget(Double totalBudget) {
            this.totalBudget = totalBudget;
            return this;
        }

        public BudgetResponseBuilder transport(Double transport) {
            this.transport = transport;
            return this;
        }

        public BudgetResponseBuilder hotel(Double hotel) {
            this.hotel = hotel;
            return this;
        }

        public BudgetResponseBuilder food(Double food) {
            this.food = food;
            return this;
        }

        public BudgetResponseBuilder activities(Double activities) {
            this.activities = activities;
            return this;
        }

        public BudgetResponseBuilder hiddenCosts(Double hiddenCosts) {
            this.hiddenCosts = hiddenCosts;
            return this;
        }

        public BudgetResponseBuilder spent(Double spent) {
            this.spent = spent;
            return this;
        }

        public BudgetResponseBuilder remainingBudget(Double remainingBudget) {
            this.remainingBudget = remainingBudget;
            return this;
        }

        public BudgetResponseBuilder budgetPercentage(Double budgetPercentage) {
            this.budgetPercentage = budgetPercentage;
            return this;
        }

        public BudgetResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public BudgetResponseBuilder hiddenCostItems(List<HiddenCostResponse> hiddenCostItems) {
            this.hiddenCostItems = hiddenCostItems;
            return this;
        }

        public BudgetResponse build() {
            return new BudgetResponse(this.totalBudget, this.transport, this.hotel, this.food, this.activities, this.hiddenCosts, this.spent, this.remainingBudget, this.budgetPercentage, this.status, this.hiddenCostItems);
        }
    }

}
