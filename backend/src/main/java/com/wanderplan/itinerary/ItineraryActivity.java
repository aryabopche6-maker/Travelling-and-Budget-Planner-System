package com.wanderplan.itinerary;

import jakarta.persistence.*;

@Entity
@Table(name = "itinerary_activities")
public class ItineraryActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_day_id", nullable = false)
    private ItineraryDay itineraryDay;

    private String time;

    @Column(nullable = false)
    private String title;

    private String category;

    private String location;

    private Double estimatedCost;

    private String duration;

        private Boolean isOutdoor = true;

    @Column(name = "order_index")
    private Integer orderIndex;

    public ItineraryActivity() {}

    public ItineraryActivity(Long id, ItineraryDay itineraryDay, String time, String title, String category, String location, Double estimatedCost, String duration, Boolean isOutdoor, Integer orderIndex) {
        this.id = id;
        this.itineraryDay = itineraryDay;
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

    public ItineraryDay getItineraryDay() {
        return itineraryDay;
    }

    public void setItineraryDay(ItineraryDay itineraryDay) {
        this.itineraryDay = itineraryDay;
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

    public Boolean getIsOutdoor() {
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

    public static ItineraryActivityBuilder builder() {
        return new ItineraryActivityBuilder();
    }

    public static class ItineraryActivityBuilder {
        private Long id;
        private ItineraryDay itineraryDay;
        private String time;
        private String title;
        private String category;
        private String location;
        private Double estimatedCost;
        private String duration;
        private Boolean isOutdoor;
        private Integer orderIndex;

        public ItineraryActivityBuilder() {}

        public ItineraryActivityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ItineraryActivityBuilder itineraryDay(ItineraryDay itineraryDay) {
            this.itineraryDay = itineraryDay;
            return this;
        }

        public ItineraryActivityBuilder time(String time) {
            this.time = time;
            return this;
        }

        public ItineraryActivityBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ItineraryActivityBuilder category(String category) {
            this.category = category;
            return this;
        }

        public ItineraryActivityBuilder location(String location) {
            this.location = location;
            return this;
        }

        public ItineraryActivityBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public ItineraryActivityBuilder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public ItineraryActivityBuilder isOutdoor(Boolean isOutdoor) {
            this.isOutdoor = isOutdoor;
            return this;
        }

        public ItineraryActivityBuilder orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public ItineraryActivity build() {
            return new ItineraryActivity(this.id, this.itineraryDay, this.time, this.title, this.category, this.location, this.estimatedCost, this.duration, this.isOutdoor, this.orderIndex);
        }
    }

}
