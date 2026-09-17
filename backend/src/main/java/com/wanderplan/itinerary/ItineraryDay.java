package com.wanderplan.itinerary;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary_days")
public class ItineraryDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private Integer dayNumber;

    private String title;

    private LocalDate date;

    @OneToMany(mappedBy = "itineraryDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
        private List<ItineraryActivity> activities = new ArrayList<>();

    public ItineraryDay() {}

    public ItineraryDay(Long id, Trip trip, Integer dayNumber, String title, LocalDate date, List<ItineraryActivity> activities) {
        this.id = id;
        this.trip = trip;
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

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
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

    public List<ItineraryActivity> getActivities() {
        return activities;
    }

    public void setActivities(List<ItineraryActivity> activities) {
        this.activities = activities;
    }

    public static ItineraryDayBuilder builder() {
        return new ItineraryDayBuilder();
    }

    public static class ItineraryDayBuilder {
        private Long id;
        private Trip trip;
        private Integer dayNumber;
        private String title;
        private LocalDate date;
        private List<ItineraryActivity> activities;

        public ItineraryDayBuilder() {}

        public ItineraryDayBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ItineraryDayBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public ItineraryDayBuilder dayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
            return this;
        }

        public ItineraryDayBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ItineraryDayBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ItineraryDayBuilder activities(List<ItineraryActivity> activities) {
            this.activities = activities;
            return this;
        }

        public ItineraryDay build() {
            return new ItineraryDay(this.id, this.trip, this.dayNumber, this.title, this.date, this.activities);
        }
    }

}
