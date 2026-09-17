package com.wanderplan.itinerary;


import java.util.List;

public class ItineraryResponse {
    private Long tripId;
    private List<ItineraryDayDto> days;

    public ItineraryResponse() {}

    public ItineraryResponse(Long tripId, List<ItineraryDayDto> days) {
        this.tripId = tripId;
        this.days = days;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public List<ItineraryDayDto> getDays() {
        return days;
    }

    public void setDays(List<ItineraryDayDto> days) {
        this.days = days;
    }

    public static ItineraryResponseBuilder builder() {
        return new ItineraryResponseBuilder();
    }

    public static class ItineraryResponseBuilder {
        private Long tripId;
        private List<ItineraryDayDto> days;

        public ItineraryResponseBuilder() {}

        public ItineraryResponseBuilder tripId(Long tripId) {
            this.tripId = tripId;
            return this;
        }

        public ItineraryResponseBuilder days(List<ItineraryDayDto> days) {
            this.days = days;
            return this;
        }

        public ItineraryResponse build() {
            return new ItineraryResponse(this.tripId, this.days);
        }
    }

}
