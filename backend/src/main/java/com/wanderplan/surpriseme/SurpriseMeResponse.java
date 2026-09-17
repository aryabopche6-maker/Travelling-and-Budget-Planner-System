package com.wanderplan.surpriseme;


import java.util.List;

public class SurpriseMeResponse {
    private String suggestedDestination;
    private String country;
    private String matchReason;
    private Double estimatedTotalBudget;
    private String recommendedTravelMode;
    private String recommendedHotelTier;
    private List<String> suggestedActivities;
    private String imageUrl;

    public SurpriseMeResponse() {}

    public SurpriseMeResponse(String suggestedDestination, String country, String matchReason, Double estimatedTotalBudget, String recommendedTravelMode, String recommendedHotelTier, List<String> suggestedActivities, String imageUrl) {
        this.suggestedDestination = suggestedDestination;
        this.country = country;
        this.matchReason = matchReason;
        this.estimatedTotalBudget = estimatedTotalBudget;
        this.recommendedTravelMode = recommendedTravelMode;
        this.recommendedHotelTier = recommendedHotelTier;
        this.suggestedActivities = suggestedActivities;
        this.imageUrl = imageUrl;
    }

    public String getSuggestedDestination() {
        return suggestedDestination;
    }

    public void setSuggestedDestination(String suggestedDestination) {
        this.suggestedDestination = suggestedDestination;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Double getEstimatedTotalBudget() {
        return estimatedTotalBudget;
    }

    public void setEstimatedTotalBudget(Double estimatedTotalBudget) {
        this.estimatedTotalBudget = estimatedTotalBudget;
    }

    public String getRecommendedTravelMode() {
        return recommendedTravelMode;
    }

    public void setRecommendedTravelMode(String recommendedTravelMode) {
        this.recommendedTravelMode = recommendedTravelMode;
    }

    public String getRecommendedHotelTier() {
        return recommendedHotelTier;
    }

    public void setRecommendedHotelTier(String recommendedHotelTier) {
        this.recommendedHotelTier = recommendedHotelTier;
    }

    public List<String> getSuggestedActivities() {
        return suggestedActivities;
    }

    public void setSuggestedActivities(List<String> suggestedActivities) {
        this.suggestedActivities = suggestedActivities;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public static SurpriseMeResponseBuilder builder() {
        return new SurpriseMeResponseBuilder();
    }

    public static class SurpriseMeResponseBuilder {
        private String suggestedDestination;
        private String country;
        private String matchReason;
        private Double estimatedTotalBudget;
        private String recommendedTravelMode;
        private String recommendedHotelTier;
        private List<String> suggestedActivities;
        private String imageUrl;

        public SurpriseMeResponseBuilder() {}

        public SurpriseMeResponseBuilder suggestedDestination(String suggestedDestination) {
            this.suggestedDestination = suggestedDestination;
            return this;
        }

        public SurpriseMeResponseBuilder country(String country) {
            this.country = country;
            return this;
        }

        public SurpriseMeResponseBuilder matchReason(String matchReason) {
            this.matchReason = matchReason;
            return this;
        }

        public SurpriseMeResponseBuilder estimatedTotalBudget(Double estimatedTotalBudget) {
            this.estimatedTotalBudget = estimatedTotalBudget;
            return this;
        }

        public SurpriseMeResponseBuilder recommendedTravelMode(String recommendedTravelMode) {
            this.recommendedTravelMode = recommendedTravelMode;
            return this;
        }

        public SurpriseMeResponseBuilder recommendedHotelTier(String recommendedHotelTier) {
            this.recommendedHotelTier = recommendedHotelTier;
            return this;
        }

        public SurpriseMeResponseBuilder suggestedActivities(List<String> suggestedActivities) {
            this.suggestedActivities = suggestedActivities;
            return this;
        }

        public SurpriseMeResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public SurpriseMeResponse build() {
            return new SurpriseMeResponse(this.suggestedDestination, this.country, this.matchReason, this.estimatedTotalBudget, this.recommendedTravelMode, this.recommendedHotelTier, this.suggestedActivities, this.imageUrl);
        }
    }

}
