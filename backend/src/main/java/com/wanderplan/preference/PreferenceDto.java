package com.wanderplan.preference;


import java.util.List;

public class PreferenceDto {
    private String travelPace;
    private String travelStyle;
    private List<String> interests;

    public PreferenceDto() {}

    public PreferenceDto(String travelPace, String travelStyle, List<String> interests) {
        this.travelPace = travelPace;
        this.travelStyle = travelStyle;
        this.interests = interests;
    }

    public String getTravelPace() {
        return travelPace;
    }

    public void setTravelPace(String travelPace) {
        this.travelPace = travelPace;
    }

    public String getTravelStyle() {
        return travelStyle;
    }

    public void setTravelStyle(String travelStyle) {
        this.travelStyle = travelStyle;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public static PreferenceDtoBuilder builder() {
        return new PreferenceDtoBuilder();
    }

    public static class PreferenceDtoBuilder {
        private String travelPace;
        private String travelStyle;
        private List<String> interests;

        public PreferenceDtoBuilder() {}

        public PreferenceDtoBuilder travelPace(String travelPace) {
            this.travelPace = travelPace;
            return this;
        }

        public PreferenceDtoBuilder travelStyle(String travelStyle) {
            this.travelStyle = travelStyle;
            return this;
        }

        public PreferenceDtoBuilder interests(List<String> interests) {
            this.interests = interests;
            return this;
        }

        public PreferenceDto build() {
            return new PreferenceDto(this.travelPace, this.travelStyle, this.interests);
        }
    }

}
