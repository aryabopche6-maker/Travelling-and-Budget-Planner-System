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
    private String alternativeName;
    private String alternativeType;
    private String alternativeLocation;
    private Double alternativeRating;
    private String alternativeImageUrl;

    public AlternativeResponse() {}

    public AlternativeResponse(String id, String category, String currentOption, String alternativeOption, Double currentCost, Double alternativeCost, Double potentialSaving, String impactDescription) {
        this(id, category, currentOption, alternativeOption, currentCost, alternativeCost, potentialSaving, impactDescription, null, null, null, null, null);
    }

    public AlternativeResponse(String id, String category, String currentOption, String alternativeOption, Double currentCost, Double alternativeCost, Double potentialSaving, String impactDescription, String alternativeName, String alternativeType, String alternativeLocation, Double alternativeRating, String alternativeImageUrl) {
        this.id = id;
        this.category = category;
        this.currentOption = currentOption;
        this.alternativeOption = alternativeOption;
        this.currentCost = currentCost;
        this.alternativeCost = alternativeCost;
        this.potentialSaving = potentialSaving;
        this.impactDescription = impactDescription;
        this.alternativeName = alternativeName;
        this.alternativeType = alternativeType;
        this.alternativeLocation = alternativeLocation;
        this.alternativeRating = alternativeRating;
        this.alternativeImageUrl = alternativeImageUrl;
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

    public String getAlternativeName() {
        return alternativeName;
    }

    public void setAlternativeName(String alternativeName) {
        this.alternativeName = alternativeName;
    }

    public String getAlternativeType() {
        return alternativeType;
    }

    public void setAlternativeType(String alternativeType) {
        this.alternativeType = alternativeType;
    }

    public String getAlternativeLocation() {
        return alternativeLocation;
    }

    public void setAlternativeLocation(String alternativeLocation) {
        this.alternativeLocation = alternativeLocation;
    }

    public Double getAlternativeRating() {
        return alternativeRating;
    }

    public void setAlternativeRating(Double alternativeRating) {
        this.alternativeRating = alternativeRating;
    }

    public String getAlternativeImageUrl() {
        return alternativeImageUrl;
    }

    public void setAlternativeImageUrl(String alternativeImageUrl) {
        this.alternativeImageUrl = alternativeImageUrl;
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
        private String alternativeName;
        private String alternativeType;
        private String alternativeLocation;
        private Double alternativeRating;
        private String alternativeImageUrl;

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

        public AlternativeResponseBuilder alternativeName(String alternativeName) {
            this.alternativeName = alternativeName;
            return this;
        }

        public AlternativeResponseBuilder alternativeType(String alternativeType) {
            this.alternativeType = alternativeType;
            return this;
        }

        public AlternativeResponseBuilder alternativeLocation(String alternativeLocation) {
            this.alternativeLocation = alternativeLocation;
            return this;
        }

        public AlternativeResponseBuilder alternativeRating(Double alternativeRating) {
            this.alternativeRating = alternativeRating;
            return this;
        }

        public AlternativeResponseBuilder alternativeImageUrl(String alternativeImageUrl) {
            this.alternativeImageUrl = alternativeImageUrl;
            return this;
        }

        public AlternativeResponse build() {
            return new AlternativeResponse(this.id, this.category, this.currentOption, this.alternativeOption, this.currentCost, this.alternativeCost, this.potentialSaving, this.impactDescription, this.alternativeName, this.alternativeType, this.alternativeLocation, this.alternativeRating, this.alternativeImageUrl);
        }
    }
}
