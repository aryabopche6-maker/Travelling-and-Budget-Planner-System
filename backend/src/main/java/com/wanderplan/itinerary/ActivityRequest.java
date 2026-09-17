package com.wanderplan.itinerary;

import jakarta.validation.constraints.NotBlank;

public class ActivityRequest {
    private Long dayId;
    private String time;
    @NotBlank(message = "Title is required")
    private String title;
    private String category;
    private String location;
    private Double estimatedCost;
    private String duration;
    private Boolean isOutdoor;

    public ActivityRequest() {}

    public ActivityRequest(Long dayId, String time, String title, String category, String location, Double estimatedCost, String duration, Boolean isOutdoor) {
        this.dayId = dayId;
        this.time = time;
        this.title = title;
        this.category = category;
        this.location = location;
        this.estimatedCost = estimatedCost;
        this.duration = duration;
        this.isOutdoor = isOutdoor;
    }

    public Long getDayId() {
        return dayId;
    }

    public void setDayId(Long dayId) {
        this.dayId = dayId;
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

}
