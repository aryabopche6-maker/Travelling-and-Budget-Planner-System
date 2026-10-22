package com.wanderplan.suggestion;

import jakarta.validation.constraints.NotBlank;

public class CreateSuggestionRequest {
    @NotBlank(message = "Suggestion title is required")
    private String title;

    @NotBlank(message = "Suggestion type is required")
    private String type; // PLACE, HOTEL, ACTIVITY, RESTAURANT, OTHER

    private String description;
    private String estimatedCost;

    public CreateSuggestionRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(String estimatedCost) { this.estimatedCost = estimatedCost; }
}
