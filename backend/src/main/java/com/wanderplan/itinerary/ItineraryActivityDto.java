package com.wanderplan.itinerary;


public class ItineraryActivityDto {
    private Long id;
    private String time;
    private String title;
    private String category;
    private String location;
    private Double estimatedCost;
    private String duration;
    private Boolean isOutdoor;
    private Integer orderIndex;

    public ItineraryActivityDto() {}

    public ItineraryActivityDto(Long id, String time, String title, String category, String location, Double estimatedCost, String duration, Boolean isOutdoor, Integer orderIndex) {
        this.id = id;
        this.time = time;
        this.title = title;
        this.category = category;
        this.location = location;
        this.estimatedCost = estimatedCost;
        this.duration = duration;
        this.isOutdoor = isOutdoor;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Boolean isOutdoor() {
        return isOutdoor;
    }

    public void setIsOutdoor(Boolean isOutdoor) {
        this.isOutdoor = isOutdoor;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public static ItineraryActivityDtoBuilder builder() {
        return new ItineraryActivityDtoBuilder();
    }

    public static class ItineraryActivityDtoBuilder {
        private Long id;
        private String time;
        private String title;
        private String category;
        private String location;
        private Double estimatedCost;
        private String duration;
        private Boolean isOutdoor;
        private Integer orderIndex;

        public ItineraryActivityDtoBuilder() {}

        public ItineraryActivityDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ItineraryActivityDtoBuilder time(String time) {
            this.time = time;
            return this;
        }

        public ItineraryActivityDtoBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ItineraryActivityDtoBuilder category(String category) {
            this.category = category;
            return this;
        }

        public ItineraryActivityDtoBuilder location(String location) {
            this.location = location;
            return this;
        }

        public ItineraryActivityDtoBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public ItineraryActivityDtoBuilder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public ItineraryActivityDtoBuilder isOutdoor(Boolean isOutdoor) {
            this.isOutdoor = isOutdoor;
            return this;
        }

        public ItineraryActivityDtoBuilder orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public ItineraryActivityDto build() {
            return new ItineraryActivityDto(this.id, this.time, this.title, this.category, this.location, this.estimatedCost, this.duration, this.isOutdoor, this.orderIndex);
        }
    }

}
