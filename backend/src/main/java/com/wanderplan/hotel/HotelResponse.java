package com.wanderplan.hotel;


import java.util.List;

public class HotelResponse {
    private String id;
    private String name;
    private String imageUrl;
    private Double rating;
    private String location;
    private Double pricePerNight;
    private String currency;
    private List<String> amenities;
    private String availabilityStatus;

    public HotelResponse() {}

    public HotelResponse(String id, String name, String imageUrl, Double rating, String location, Double pricePerNight, String currency, List<String> amenities, String availabilityStatus) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.location = location;
        this.pricePerNight = pricePerNight;
        this.currency = currency;
        this.amenities = amenities;
        this.availabilityStatus = availabilityStatus;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public Double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(Double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public static HotelResponseBuilder builder() {
        return new HotelResponseBuilder();
    }

    public static class HotelResponseBuilder {
        private String id;
        private String name;
        private String imageUrl;
        private Double rating;
        private String location;
        private Double pricePerNight;
        private String currency;
        private List<String> amenities;
        private String availabilityStatus;

        public HotelResponseBuilder() {}

        public HotelResponseBuilder id(String id) {
            this.id = id;
            return this;
        }

        public HotelResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public HotelResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public HotelResponseBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public HotelResponseBuilder location(String location) {
            this.location = location;
            return this;
        }

        public HotelResponseBuilder pricePerNight(Double pricePerNight) {
            this.pricePerNight = pricePerNight;
            return this;
        }

        public HotelResponseBuilder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public HotelResponseBuilder amenities(List<String> amenities) {
            this.amenities = amenities;
            return this;
        }

        public HotelResponseBuilder availabilityStatus(String availabilityStatus) {
            this.availabilityStatus = availabilityStatus;
            return this;
        }

        public HotelResponse build() {
            return new HotelResponse(this.id, this.name, this.imageUrl, this.rating, this.location, this.pricePerNight, this.currency, this.amenities, this.availabilityStatus);
        }
    }

}
