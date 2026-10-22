package com.wanderplan.itinerary;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;

@Entity
@Table(name = "trip_selected_places")
public class TripSelectedPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name;

    private String category;

    private String location;

    private Double estimatedCost;

    private String duration;

    @Column(length = 1000)
    private String imageUrl;

    private Double latitude;

    private Double longitude;

    private Integer preferredDay;

    public TripSelectedPlace() {}

    public TripSelectedPlace(Long id, Trip trip, String name, String category, String location, Double estimatedCost, String duration, String imageUrl, Double latitude, Double longitude, Integer preferredDay) {
        this.id = id;
        this.trip = trip;
        this.name = name;
        this.category = category;
        this.location = location;
        this.estimatedCost = estimatedCost;
        this.duration = duration;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.preferredDay = preferredDay;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
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

    public Integer getPreferredDay() {
        return preferredDay;
    }

    public void setPreferredDay(Integer preferredDay) {
        this.preferredDay = preferredDay;
    }

    public static TripSelectedPlaceBuilder builder() {
        return new TripSelectedPlaceBuilder();
    }

    public static class TripSelectedPlaceBuilder {
        private Long id;
        private Trip trip;
        private String name;
        private String category;
        private String location;
        private Double estimatedCost;
        private String duration;
        private String imageUrl;
        private Double latitude;
        private Double longitude;
        private Integer preferredDay;

        public TripSelectedPlaceBuilder() {}

        public TripSelectedPlaceBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TripSelectedPlaceBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public TripSelectedPlaceBuilder name(String name) {
            this.name = name;
            return this;
        }

        public TripSelectedPlaceBuilder category(String category) {
            this.category = category;
            return this;
        }

        public TripSelectedPlaceBuilder location(String location) {
            this.location = location;
            return this;
        }

        public TripSelectedPlaceBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public TripSelectedPlaceBuilder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public TripSelectedPlaceBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public TripSelectedPlaceBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public TripSelectedPlaceBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public TripSelectedPlaceBuilder preferredDay(Integer preferredDay) {
            this.preferredDay = preferredDay;
            return this;
        }

        public TripSelectedPlace build() {
            return new TripSelectedPlace(this.id, this.trip, this.name, this.category, this.location, this.estimatedCost, this.duration, this.imageUrl, this.latitude, this.longitude, this.preferredDay);
        }
    }
}
