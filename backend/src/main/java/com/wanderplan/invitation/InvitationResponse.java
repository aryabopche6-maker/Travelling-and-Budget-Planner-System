package com.wanderplan.invitation;

import java.time.LocalDateTime;

public class InvitationResponse {
    private Long id;
    private Long tripId;
    private String destination;
    private String invitedEmail;
    private String invitedByName;
    private InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public InvitationResponse() {}

    public InvitationResponse(Long id, Long tripId, String destination, String invitedEmail, String invitedByName, InvitationStatus status, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.id = id;
        this.tripId = tripId;
        this.destination = destination;
        this.invitedEmail = invitedEmail;
        this.invitedByName = invitedByName;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getInvitedEmail() { return invitedEmail; }
    public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }

    public String getInvitedByName() { return invitedByName; }
    public void setInvitedByName(String invitedByName) { this.invitedByName = invitedByName; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public static InvitationResponseBuilder builder() {
        return new InvitationResponseBuilder();
    }

    public static class InvitationResponseBuilder {
        private Long id;
        private Long tripId;
        private String destination;
        private String invitedEmail;
        private String invitedByName;
        private InvitationStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public InvitationResponseBuilder id(Long id) { this.id = id; return this; }
        public InvitationResponseBuilder tripId(Long tripId) { this.tripId = tripId; return this; }
        public InvitationResponseBuilder destination(String destination) { this.destination = destination; return this; }
        public InvitationResponseBuilder invitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; return this; }
        public InvitationResponseBuilder invitedByName(String invitedByName) { this.invitedByName = invitedByName; return this; }
        public InvitationResponseBuilder status(InvitationStatus status) { this.status = status; return this; }
        public InvitationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public InvitationResponseBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

        public InvitationResponse build() {
            return new InvitationResponse(id, tripId, destination, invitedEmail, invitedByName, status, createdAt, expiresAt);
        }
    }
}
