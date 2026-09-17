package com.wanderplan.place;


import java.util.List;

public class PlaceResponse {
    private String id;
    private String name;
    private String category;
    private Double rating;
    private String location;
    private Double estimatedCost;
    private String duration;
    private String description;
    private String imageUrl;
    private Double latitude;
    private Double longitude;

    public PlaceResponse() {}

    public PlaceResponse(String id, String name, String category, Double rating, String location, Double estimatedCost, String duration, String description, String imageUrl, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.rating = rating;
        this.location = location;
        this.estimatedCost = estimatedCost;
        this.duration = duration;
        this.description = description;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public static PlaceResponseBuilder builder() {
        return new PlaceResponseBuilder();
    }

    public static class PlaceResponseBuilder {
        private String id;
        private String name;
        private String category;
        private Double rating;
        private String location;
        private Double estimatedCost;
        private String duration;
        private String description;
        private String imageUrl;
        private Double latitude;
        private Double longitude;

        public PlaceResponseBuilder() {}

        public PlaceResponseBuilder id(String id) {
            this.id = id;
            return this;
        }

        public PlaceResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PlaceResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public PlaceResponseBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public PlaceResponseBuilder location(String location) {
            this.location = location;
            return this;
        }

        public PlaceResponseBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public PlaceResponseBuilder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public PlaceResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public PlaceResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public PlaceResponseBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public PlaceResponseBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public PlaceResponse build() {
            return new PlaceResponse(this.id, this.name, this.category, this.rating, this.location, this.estimatedCost, this.duration, this.description, this.imageUrl, this.latitude, this.longitude);
        }
    }

}
