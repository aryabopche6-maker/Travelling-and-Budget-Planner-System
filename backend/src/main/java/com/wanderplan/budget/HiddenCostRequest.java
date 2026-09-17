package com.wanderplan.budget;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HiddenCostRequest {
    @NotBlank(message = "Category is required")
    private String category;
    private String description;
    @NotNull(message = "Estimated cost is required")
    private Double estimatedCost;
    private Boolean isEstimate;

    public HiddenCostRequest() {}

    public HiddenCostRequest(String category, String description, Double estimatedCost, Boolean isEstimate) {
        this.category = category;
        this.description = description;
        this.estimatedCost = estimatedCost;
        this.isEstimate = isEstimate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public Boolean isEstimate() {
        return isEstimate;
    }

    public Boolean getIsEstimate() {
        return isEstimate;
    }

    public void setIsEstimate(Boolean isEstimate) {
        this.isEstimate = isEstimate;
    }

}
