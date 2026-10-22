package com.wanderplan.suggestion;

public class ReviewSuggestionRequest {
    private String action; // APPROVE or REJECT
    private String adminNote;

    public ReviewSuggestionRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
}
