package com.wanderplan.suggestion;

import java.time.LocalDateTime;

public class SuggestionResponse {
    private Long id;
    private Long suggestedBy;
    private String suggestedByName;
    private String type;
    private String title;
    private String description;
    private String estimatedCost;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public SuggestionResponse() {}

    public SuggestionResponse(Long id, Long suggestedBy, String suggestedByName, String type, String title,
                              String description, String estimatedCost, String status, String adminNote,
                              LocalDateTime createdAt, LocalDateTime reviewedAt) {
        this.id = id;
        this.suggestedBy = suggestedBy;
        this.suggestedByName = suggestedByName;
        this.type = type;
        this.title = title;
        this.description = description;
        this.estimatedCost = estimatedCost;
        this.status = status;
        this.adminNote = adminNote;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public static SuggestionResponseBuilder builder() {
        return new SuggestionResponseBuilder();
    }

    public static class SuggestionResponseBuilder {
        private Long id, suggestedBy;
        private String suggestedByName, type, title, description, estimatedCost, status, adminNote;
        private LocalDateTime createdAt, reviewedAt;

        public SuggestionResponseBuilder id(Long id) { this.id = id; return this; }
        public SuggestionResponseBuilder suggestedBy(Long suggestedBy) { this.suggestedBy = suggestedBy; return this; }
        public SuggestionResponseBuilder suggestedByName(String n) { this.suggestedByName = n; return this; }
        public SuggestionResponseBuilder type(String type) { this.type = type; return this; }
        public SuggestionResponseBuilder title(String title) { this.title = title; return this; }
        public SuggestionResponseBuilder description(String d) { this.description = d; return this; }
        public SuggestionResponseBuilder estimatedCost(String c) { this.estimatedCost = c; return this; }
        public SuggestionResponseBuilder status(String s) { this.status = s; return this; }
        public SuggestionResponseBuilder adminNote(String n) { this.adminNote = n; return this; }
        public SuggestionResponseBuilder createdAt(LocalDateTime c) { this.createdAt = c; return this; }
        public SuggestionResponseBuilder reviewedAt(LocalDateTime r) { this.reviewedAt = r; return this; }

        public SuggestionResponse build() {
            return new SuggestionResponse(id, suggestedBy, suggestedByName, type, title, description,
                    estimatedCost, status, adminNote, createdAt, reviewedAt);
        }
    }
}
