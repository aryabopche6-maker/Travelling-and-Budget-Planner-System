package com.wanderplan.budget;


public class AlternativeResponse {
    private String id;
    private String category;
    private String currentOption;
    private String alternativeOption;
    private Double currentCost;
    private Double alternativeCost;
    private Double potentialSaving;
    private String impactDescription;

    public AlternativeResponse() {}

    public AlternativeResponse(String id, String category, String currentOption, String alternativeOption, Double currentCost, Double alternativeCost, Double potentialSaving, String impactDescription) {
        this.id = id;
        this.category = category;
        this.currentOption = currentOption;
        this.alternativeOption = alternativeOption;
        this.currentCost = currentCost;
        this.alternativeCost = alternativeCost;
        this.potentialSaving = potentialSaving;
        this.impactDescription = impactDescription;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCurrentOption() {
        return currentOption;
    }

    public void setCurrentOption(String currentOption) {
        this.currentOption = currentOption;
    }

    public String getAlternativeOption() {
        return alternativeOption;
    }

    public void setAlternativeOption(String alternativeOption) {
        this.alternativeOption = alternativeOption;
    }

    public Double getCurrentCost() {
        return currentCost;
    }

    public void setCurrentCost(Double currentCost) {
        this.currentCost = currentCost;
    }

    public Double getAlternativeCost() {
        return alternativeCost;
    }

    public void setAlternativeCost(Double alternativeCost) {
        this.alternativeCost = alternativeCost;
    }

    public Double getPotentialSaving() {
        return potentialSaving;
    }

    public void setPotentialSaving(Double potentialSaving) {
        this.potentialSaving = potentialSaving;
    }

    public String getImpactDescription() {
        return impactDescription;
    }

    public void setImpactDescription(String impactDescription) {
        this.impactDescription = impactDescription;
    }

    public static AlternativeResponseBuilder builder() {
        return new AlternativeResponseBuilder();
    }

    public static class AlternativeResponseBuilder {
        private String id;
        private String category;
        private String currentOption;
        private String alternativeOption;
        private Double currentCost;
        private Double alternativeCost;
        private Double potentialSaving;
        private String impactDescription;

        public AlternativeResponseBuilder() {}

        public AlternativeResponseBuilder id(String id) {
            this.id = id;
            return this;
        }

        public AlternativeResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public AlternativeResponseBuilder currentOption(String currentOption) {
            this.currentOption = currentOption;
            return this;
        }

        public AlternativeResponseBuilder alternativeOption(String alternativeOption) {
            this.alternativeOption = alternativeOption;
            return this;
        }

        public AlternativeResponseBuilder currentCost(Double currentCost) {
            this.currentCost = currentCost;
            return this;
        }

        public AlternativeResponseBuilder alternativeCost(Double alternativeCost) {
            this.alternativeCost = alternativeCost;
            return this;
        }

        public AlternativeResponseBuilder potentialSaving(Double potentialSaving) {
            this.potentialSaving = potentialSaving;
            return this;
        }

        public AlternativeResponseBuilder impactDescription(String impactDescription) {
            this.impactDescription = impactDescription;
            return this;
        }

        public AlternativeResponse build() {
            return new AlternativeResponse(this.id, this.category, this.currentOption, this.alternativeOption, this.currentCost, this.alternativeCost, this.potentialSaving, this.impactDescription);
        }
    }

}
