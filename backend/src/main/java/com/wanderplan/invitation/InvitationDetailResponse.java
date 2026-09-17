package com.wanderplan.invitation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvitationDetailResponse {
    private String token;
    private Long tripId;
    private String destination;
    private String startingLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private String invitedEmail;
    private String invitedByName;
    private InvitationStatus status;
    private boolean isExpired;
    private boolean requiresSignup;
    private LocalDateTime expiresAt;

    public InvitationDetailResponse() {}

    public InvitationDetailResponse(String token, Long tripId, String destination, String startingLocation, LocalDate startDate, LocalDate endDate, String invitedEmail, String invitedByName, InvitationStatus status, boolean isExpired, boolean requiresSignup, LocalDateTime expiresAt) {
        this.token = token;
        this.tripId = tripId;
        this.destination = destination;
        this.startingLocation = startingLocation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.invitedEmail = invitedEmail;
        this.invitedByName = invitedByName;
        this.status = status;
        this.isExpired = isExpired;
        this.requiresSignup = requiresSignup;
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getStartingLocation() { return startingLocation; }
    public void setStartingLocation(String startingLocation) { this.startingLocation = startingLocation; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getInvitedEmail() { return invitedEmail; }
    public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }

    public String getInvitedByName() { return invitedByName; }
    public void setInvitedByName(String invitedByName) { this.invitedByName = invitedByName; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public boolean isExpired() { return isExpired; }
    public void setExpired(boolean expired) { isExpired = expired; }

    public boolean isRequiresSignup() { return requiresSignup; }
    public void setRequiresSignup(boolean requiresSignup) { this.requiresSignup = requiresSignup; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public static InvitationDetailResponseBuilder builder() {
        return new InvitationDetailResponseBuilder();
    }

    public static class InvitationDetailResponseBuilder {
        private String token;
        private Long tripId;
        private String destination;
        private String startingLocation;
        private LocalDate startDate;
        private LocalDate endDate;
        private String invitedEmail;
        private String invitedByName;
        private InvitationStatus status;
        private boolean isExpired;
        private boolean requiresSignup;
        private LocalDateTime expiresAt;

        public InvitationDetailResponseBuilder token(String token) { this.token = token; return this; }
        public InvitationDetailResponseBuilder tripId(Long tripId) { this.tripId = tripId; return this; }
        public InvitationDetailResponseBuilder destination(String destination) { this.destination = destination; return this; }
        public InvitationDetailResponseBuilder startingLocation(String startingLocation) { this.startingLocation = startingLocation; return this; }
        public InvitationDetailResponseBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public InvitationDetailResponseBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public InvitationDetailResponseBuilder invitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; return this; }
        public InvitationDetailResponseBuilder invitedByName(String invitedByName) { this.invitedByName = invitedByName; return this; }
        public InvitationDetailResponseBuilder status(InvitationStatus status) { this.status = status; return this; }
        public InvitationDetailResponseBuilder isExpired(boolean isExpired) { this.isExpired = isExpired; return this; }
        public InvitationDetailResponseBuilder requiresSignup(boolean requiresSignup) { this.requiresSignup = requiresSignup; return this; }
        public InvitationDetailResponseBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

        public InvitationDetailResponse build() {
            return new InvitationDetailResponse(token, tripId, destination, startingLocation, startDate, endDate, invitedEmail, invitedByName, status, isExpired, requiresSignup, expiresAt);
        }
    }
}
