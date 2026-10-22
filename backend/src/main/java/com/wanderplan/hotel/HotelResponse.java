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
    private String hotelType; // Hotel, Resort, Hostel, Boutique, Villa
    private String matchedMood;
    private Integer matchScore;
    private Double latitude;
    private Double longitude;

    public HotelResponse() {}

    public HotelResponse(String id, String name, String imageUrl, Double rating, String location, Double pricePerNight, String currency, List<String> amenities, String availabilityStatus) {
        this(id, name, imageUrl, rating, location, pricePerNight, currency, amenities, availabilityStatus, "Hotel", null, 0, null, null);
    }

    public HotelResponse(String id, String name, String imageUrl, Double rating, String location, Double pricePerNight, String currency, List<String> amenities, String availabilityStatus, String hotelType, String matchedMood, Integer matchScore, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.location = location;
        this.pricePerNight = pricePerNight;
        this.currency = currency;
        this.amenities = amenities;
        this.availabilityStatus = availabilityStatus;
        this.hotelType = hotelType != null ? hotelType : "Hotel";
        this.matchedMood = matchedMood;
        this.matchScore = matchScore != null ? matchScore : 0;
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

    public String getHotelType() {
        return hotelType;
    }

    public void setHotelType(String hotelType) {
        this.hotelType = hotelType;
    }

    public String getMatchedMood() {
        return matchedMood;
    }

    public void setMatchedMood(String matchedMood) {
        this.matchedMood = matchedMood;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
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
        private String hotelType;
        private String matchedMood;
        private Integer matchScore;
        private Double latitude;
        private Double longitude;

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

        public HotelResponseBuilder hotelType(String hotelType) {
            this.hotelType = hotelType;
            return this;
        }

        public HotelResponseBuilder matchedMood(String matchedMood) {
            this.matchedMood = matchedMood;
            return this;
        }

        public HotelResponseBuilder matchScore(Integer matchScore) {
            this.matchScore = matchScore;
            return this;
        }

        public HotelResponseBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public HotelResponseBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public HotelResponse build() {
            return new HotelResponse(this.id, this.name, this.imageUrl, this.rating, this.location, this.pricePerNight, this.currency, this.amenities, this.availabilityStatus, this.hotelType, this.matchedMood, this.matchScore, this.latitude, this.longitude);
        }
    }

}
