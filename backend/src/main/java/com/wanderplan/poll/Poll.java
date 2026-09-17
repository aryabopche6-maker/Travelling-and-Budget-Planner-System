package com.wanderplan.poll;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polls")
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String title;

    private String category; // Hotel, Destination, Activity, Place, Itinerary

        private Boolean isAnonymous = false;

    private Long createdBy;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<PollOption> options = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Poll() {}

    public Poll(Long id, Trip trip, String title, String category, Boolean isAnonymous, Long createdBy, List<PollOption> options, LocalDateTime createdAt) {
        this.id = id;
        this.trip = trip;
        this.title = title;
        this.category = category;
        this.isAnonymous = isAnonymous;
        this.createdBy = createdBy;
        this.options = options;
        this.createdAt = createdAt;
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

    public Boolean isAnonymous() {
        return isAnonymous;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public List<PollOption> getOptions() {
        return options;
    }

    public void setOptions(List<PollOption> options) {
        this.options = options;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static PollBuilder builder() {
        return new PollBuilder();
    }

    public static class PollBuilder {
        private Long id;
        private Trip trip;
        private String title;
        private String category;
        private Boolean isAnonymous;
        private Long createdBy;
        private List<PollOption> options;
        private LocalDateTime createdAt;

        public PollBuilder() {}

        public PollBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PollBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public PollBuilder title(String title) {
            this.title = title;
            return this;
        }

        public PollBuilder category(String category) {
            this.category = category;
            return this;
        }

        public PollBuilder isAnonymous(Boolean isAnonymous) {
            this.isAnonymous = isAnonymous;
            return this;
        }

        public PollBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public PollBuilder options(List<PollOption> options) {
            this.options = options;
            return this;
        }

        public PollBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Poll build() {
            return new Poll(this.id, this.trip, this.title, this.category, this.isAnonymous, this.createdBy, this.options, this.createdAt);
        }
    }

}
