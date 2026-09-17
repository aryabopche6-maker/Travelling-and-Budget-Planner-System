package com.wanderplan.member;


import java.time.LocalDateTime;

public class MemberResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private Boolean isTripAdmin;
    private String role; // "TRIP_ADMIN" or "TRAVELER"
    private String status;
    private LocalDateTime joinedAt;

    public MemberResponse() {}

    public MemberResponse(Long id, Long userId, String name, String email, Boolean isTripAdmin, String role, String status, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.isTripAdmin = isTripAdmin;
        this.role = role;
        this.status = status;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean isTripAdmin() {
        return isTripAdmin;
    }

    public void setIsTripAdmin(Boolean isTripAdmin) {
        this.isTripAdmin = isTripAdmin;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public static MemberResponseBuilder builder() {
        return new MemberResponseBuilder();
    }

    public static class MemberResponseBuilder {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private Boolean isTripAdmin;
        private String role;
        private String status;
        private LocalDateTime joinedAt;

        public MemberResponseBuilder() {}

        public MemberResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MemberResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public MemberResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public MemberResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public MemberResponseBuilder isTripAdmin(Boolean isTripAdmin) {
            this.isTripAdmin = isTripAdmin;
            return this;
        }

        public MemberResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public MemberResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public MemberResponseBuilder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }

        public MemberResponse build() {
            return new MemberResponse(this.id, this.userId, this.name, this.email, this.isTripAdmin, this.role, this.status, this.joinedAt);
        }
    }

}
