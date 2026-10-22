package com.wanderplan.activity;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_feed")
public class ActivityFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String action; // MEMBER_JOINED, INVITATION_SENT, EXPENSE_ADDED, POLL_CREATED, VOTE_CAST, ITINERARY_UPDATED, SUGGESTION_ADDED, SUGGESTION_APPROVED, SUGGESTION_REJECTED

    @Column(nullable = false, length = 500)
    private String description;

    private String icon; // lucide icon name hint

    private String category; // MEMBER, EXPENSE, POLL, ITINERARY, SUGGESTION

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public ActivityFeed() {}

    public ActivityFeed(Long id, Trip trip, Long userId, String userName, String action, String description, String icon, String category, LocalDateTime createdAt) {
        this.id = id;
        this.trip = trip;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.description = description;
        this.icon = icon;
        this.category = category;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ActivityFeedBuilder builder() {
        return new ActivityFeedBuilder();
    }

    public static class ActivityFeedBuilder {
        private Long id;
        private Trip trip;
        private Long userId;
        private String userName;
        private String action;
        private String description;
        private String icon;
        private String category;
        private LocalDateTime createdAt;

        public ActivityFeedBuilder id(Long id) { this.id = id; return this; }
        public ActivityFeedBuilder trip(Trip trip) { this.trip = trip; return this; }
        public ActivityFeedBuilder userId(Long userId) { this.userId = userId; return this; }
        public ActivityFeedBuilder userName(String userName) { this.userName = userName; return this; }
        public ActivityFeedBuilder action(String action) { this.action = action; return this; }
        public ActivityFeedBuilder description(String description) { this.description = description; return this; }
        public ActivityFeedBuilder icon(String icon) { this.icon = icon; return this; }
        public ActivityFeedBuilder category(String category) { this.category = category; return this; }
        public ActivityFeedBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ActivityFeed build() {
            return new ActivityFeed(id, trip, userId, userName, action, description, icon, category, createdAt);
        }
    }
}
