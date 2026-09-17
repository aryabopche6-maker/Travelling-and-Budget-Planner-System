package com.wanderplan.budget;


public class HiddenCostResponse {
    private Long id;
    private String category;
    private String description;
    private Double estimatedCost;
    private Boolean isEstimate;

    public HiddenCostResponse() {}

    public HiddenCostResponse(Long id, String category, String description, Double estimatedCost, Boolean isEstimate) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.estimatedCost = estimatedCost;
        this.isEstimate = isEstimate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setIsEstimate(Boolean isEstimate) {
        this.isEstimate = isEstimate;
    }

    public static HiddenCostResponseBuilder builder() {
        return new HiddenCostResponseBuilder();
    }

    public static class HiddenCostResponseBuilder {
        private Long id;
        private String category;
        private String description;
        private Double estimatedCost;
        private Boolean isEstimate;

        public HiddenCostResponseBuilder() {}

        public HiddenCostResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HiddenCostResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public HiddenCostResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public HiddenCostResponseBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public HiddenCostResponseBuilder isEstimate(Boolean isEstimate) {
            this.isEstimate = isEstimate;
            return this;
        }

        public HiddenCostResponse build() {
            return new HiddenCostResponse(this.id, this.category, this.description, this.estimatedCost, this.isEstimate);
        }
    }

}
