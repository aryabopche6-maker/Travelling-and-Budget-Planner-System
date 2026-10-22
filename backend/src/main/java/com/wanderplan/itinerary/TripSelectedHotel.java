package com.wanderplan.itinerary;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;

@Entity
@Table(name = "trip_selected_hotels")
public class TripSelectedHotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name;

    private String location;

    private Double pricePerNight;

    private String currency;

    private Double rating;

    private String hotelType;

    @Column(length = 1000)
    private String imageUrl;

    private Double latitude;

    private Double longitude;

    public TripSelectedHotel() {}

    public TripSelectedHotel(Long id, Trip trip, String name, String location, Double pricePerNight, String currency, Double rating, String hotelType, String imageUrl, Double latitude, Double longitude) {
        this.id = id;
        this.trip = trip;
        this.name = name;
        this.location = location;
        this.pricePerNight = pricePerNight;
        this.currency = currency;
        this.rating = rating;
        this.hotelType = hotelType;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
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

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getHotelType() {
        return hotelType;
    }

    public void setHotelType(String hotelType) {
        this.hotelType = hotelType;
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

    public static TripSelectedHotelBuilder builder() {
        return new TripSelectedHotelBuilder();
    }

    public static class TripSelectedHotelBuilder {
        private Long id;
        private Trip trip;
        private String name;
        private String location;
        private Double pricePerNight;
        private String currency;
        private Double rating;
        private String hotelType;
        private String imageUrl;
        private Double latitude;
        private Double longitude;

        public TripSelectedHotelBuilder() {}

        public TripSelectedHotelBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TripSelectedHotelBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public TripSelectedHotelBuilder name(String name) {
            this.name = name;
            return this;
        }

        public TripSelectedHotelBuilder location(String location) {
            this.location = location;
            return this;
        }

        public TripSelectedHotelBuilder pricePerNight(Double pricePerNight) {
            this.pricePerNight = pricePerNight;
            return this;
        }

        public TripSelectedHotelBuilder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public TripSelectedHotelBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public TripSelectedHotelBuilder hotelType(String hotelType) {
            this.hotelType = hotelType;
            return this;
        }

        public TripSelectedHotelBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public TripSelectedHotelBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public TripSelectedHotelBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public TripSelectedHotel build() {
            return new TripSelectedHotel(this.id, this.trip, this.name, this.location, this.pricePerNight, this.currency, this.rating, this.hotelType, this.imageUrl, this.latitude, this.longitude);
        }
    }
}
