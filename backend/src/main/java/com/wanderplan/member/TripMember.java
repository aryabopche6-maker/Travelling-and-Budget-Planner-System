package com.wanderplan.member;

import com.wanderplan.trip.Trip;
import com.wanderplan.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_members")
public class TripMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Boolean isTripAdmin;

    @Column(nullable = false)
    private String status; // ACCEPTED, INVITED, REJECTED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    public TripMember() {}

    public TripMember(Long id, Trip trip, User user, Boolean isTripAdmin, String status, LocalDateTime joinedAt) {
        this.id = id;
        this.trip = trip;
        this.user = user;
        this.isTripAdmin = isTripAdmin;
        this.status = status;
        this.joinedAt = joinedAt;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean isTripAdmin() {
        return isTripAdmin;
    }

    public Boolean getIsTripAdmin() {
        return isTripAdmin;
    }

    public void setIsTripAdmin(Boolean isTripAdmin) {
        this.isTripAdmin = isTripAdmin;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public static TripMemberBuilder builder() {
        return new TripMemberBuilder();
    }

    public static class TripMemberBuilder {
        private Long id;
        private Trip trip;
        private User user;
        private Boolean isTripAdmin;
        private String status;
        private LocalDateTime joinedAt;

        public TripMemberBuilder() {}

        public TripMemberBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TripMemberBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public TripMemberBuilder user(User user) {
            this.user = user;
            return this;
        }

        public TripMemberBuilder isTripAdmin(Boolean isTripAdmin) {
            this.isTripAdmin = isTripAdmin;
            return this;
        }

        public TripMemberBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TripMemberBuilder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }

        public TripMember build() {
            return new TripMember(this.id, this.trip, this.user, this.isTripAdmin, this.status, this.joinedAt);
        }
    }

}
