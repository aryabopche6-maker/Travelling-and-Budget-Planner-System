package com.wanderplan.preference;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;

@Entity
@Table(name = "trip_preferences")
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name; // e.g. Adventure, Beach & Relax, Nature, Food & Culture

    public Preference() {}

    public Preference(Long id, Trip trip, String name) {
        this.id = id;
        this.trip = trip;
        this.name = name;
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

    public static PreferenceBuilder builder() {
        return new PreferenceBuilder();
    }

    public static class PreferenceBuilder {
        private Long id;
        private Trip trip;
        private String name;

        public PreferenceBuilder() {}

        public PreferenceBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PreferenceBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public PreferenceBuilder name(String name) {
            this.name = name;
            return this;
        }

        public Preference build() {
            return new Preference(this.id, this.trip, this.name);
        }
    }

}
