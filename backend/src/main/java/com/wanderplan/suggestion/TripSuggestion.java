package com.wanderplan.suggestion;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_suggestions")
public class TripSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private Long suggestedBy;

    @Column(nullable = false)
    private String suggestedByName;

    @Column(nullable = false)
    private String type; // PLACE, HOTEL, ACTIVITY, RESTAURANT, OTHER

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String estimatedCost;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    private String adminNote; // Admin can leave a note on approval/rejection

    private Long reviewedBy;

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public TripSuggestion() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Long getSuggestedBy() { return suggestedBy; }
    public void setSuggestedBy(Long suggestedBy) { this.suggestedBy = suggestedBy; }

    public String getSuggestedByName() { return suggestedByName; }
    public void setSuggestedByName(String suggestedByName) { this.suggestedByName = suggestedByName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(String estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public Long getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static TripSuggestionBuilder builder() {
        return new TripSuggestionBuilder();
    }

    public static class TripSuggestionBuilder {
        private final TripSuggestion s = new TripSuggestion();

        public TripSuggestionBuilder trip(Trip trip) { s.trip = trip; return this; }
        public TripSuggestionBuilder suggestedBy(Long suggestedBy) { s.suggestedBy = suggestedBy; return this; }
        public TripSuggestionBuilder suggestedByName(String name) { s.suggestedByName = name; return this; }
        public TripSuggestionBuilder type(String type) { s.type = type; return this; }
        public TripSuggestionBuilder title(String title) { s.title = title; return this; }
        public TripSuggestionBuilder description(String description) { s.description = description; return this; }
        public TripSuggestionBuilder estimatedCost(String estimatedCost) { s.estimatedCost = estimatedCost; return this; }
        public TripSuggestionBuilder status(String status) { s.status = status; return this; }

        public TripSuggestion build() { return s; }
    }
}
