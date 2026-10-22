package com.wanderplan.activity;

import java.time.LocalDateTime;

public class ActivityFeedResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String description;
    private String icon;
    private String category;
    private LocalDateTime createdAt;

    public ActivityFeedResponse() {}

    public ActivityFeedResponse(Long id, Long userId, String userName, String action, String description, String icon, String category, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.description = description;
        this.icon = icon;
        this.category = category;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public static ActivityFeedResponseBuilder builder() {
        return new ActivityFeedResponseBuilder();
    }

    public static class ActivityFeedResponseBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private String action;
        private String description;
        private String icon;
        private String category;
        private LocalDateTime createdAt;

        public ActivityFeedResponseBuilder id(Long id) { this.id = id; return this; }
        public ActivityFeedResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public ActivityFeedResponseBuilder userName(String userName) { this.userName = userName; return this; }
        public ActivityFeedResponseBuilder action(String action) { this.action = action; return this; }
        public ActivityFeedResponseBuilder description(String description) { this.description = description; return this; }
        public ActivityFeedResponseBuilder icon(String icon) { this.icon = icon; return this; }
        public ActivityFeedResponseBuilder category(String category) { this.category = category; return this; }
        public ActivityFeedResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ActivityFeedResponse build() {
            return new ActivityFeedResponse(id, userId, userName, action, description, icon, category, createdAt);
        }
    }
}
