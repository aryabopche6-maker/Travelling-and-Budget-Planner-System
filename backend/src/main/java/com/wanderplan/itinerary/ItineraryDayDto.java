package com.wanderplan.itinerary;


import java.time.LocalDate;
import java.util.List;

public class ItineraryDayDto {
    private Long id;
    private Integer dayNumber;
    private String title;
    private LocalDate date;
    private List<ItineraryActivityDto> activities;

    public ItineraryDayDto() {}

    public ItineraryDayDto(Long id, Integer dayNumber, String title, LocalDate date, List<ItineraryActivityDto> activities) {
        this.id = id;
        this.dayNumber = dayNumber;
        this.title = title;
        this.date = date;
        this.activities = activities;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(Integer dayNumber) {
        this.dayNumber = dayNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<ItineraryActivityDto> getActivities() {
        return activities;
    }

    public void setActivities(List<ItineraryActivityDto> activities) {
        this.activities = activities;
    }

    public static ItineraryDayDtoBuilder builder() {
        return new ItineraryDayDtoBuilder();
    }

    public static class ItineraryDayDtoBuilder {
        private Long id;
        private Integer dayNumber;
        private String title;
        private LocalDate date;
        private List<ItineraryActivityDto> activities;

        public ItineraryDayDtoBuilder() {}

        public ItineraryDayDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ItineraryDayDtoBuilder dayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
            return this;
        }

        public ItineraryDayDtoBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ItineraryDayDtoBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ItineraryDayDtoBuilder activities(List<ItineraryActivityDto> activities) {
            this.activities = activities;
            return this;
        }

        public ItineraryDayDto build() {
            return new ItineraryDayDto(this.id, this.dayNumber, this.title, this.date, this.activities);
        }
    }

}
