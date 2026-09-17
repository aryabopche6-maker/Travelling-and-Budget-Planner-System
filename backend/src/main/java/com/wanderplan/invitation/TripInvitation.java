package com.wanderplan.invitation;

import com.wanderplan.trip.Trip;
import com.wanderplan.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_invitations")
public class TripInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String invitedEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public TripInvitation() {}

    public TripInvitation(Long id, Trip trip, String invitedEmail, User invitedBy, String token, InvitationStatus status, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.id = id;
        this.trip = trip;
        this.invitedEmail = invitedEmail;
        this.invitedBy = invitedBy;
        this.token = token;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public String getInvitedEmail() { return invitedEmail; }
    public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }

    public User getInvitedBy() { return invitedBy; }
    public void setInvitedBy(User invitedBy) { this.invitedBy = invitedBy; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public static TripInvitationBuilder builder() {
        return new TripInvitationBuilder();
    }

    public static class TripInvitationBuilder {
        private Long id;
        private Trip trip;
        private String invitedEmail;
        private User invitedBy;
        private String token;
        private InvitationStatus status = InvitationStatus.PENDING;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public TripInvitationBuilder id(Long id) { this.id = id; return this; }
        public TripInvitationBuilder trip(Trip trip) { this.trip = trip; return this; }
        public TripInvitationBuilder invitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; return this; }
        public TripInvitationBuilder invitedBy(User invitedBy) { this.invitedBy = invitedBy; return this; }
        public TripInvitationBuilder token(String token) { this.token = token; return this; }
        public TripInvitationBuilder status(InvitationStatus status) { this.status = status; return this; }
        public TripInvitationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TripInvitationBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

        public TripInvitation build() {
            return new TripInvitation(id, trip, invitedEmail, invitedBy, token, status, createdAt, expiresAt);
        }
    }
}
