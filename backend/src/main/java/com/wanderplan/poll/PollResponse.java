package com.wanderplan.poll;


import java.time.LocalDateTime;
import java.util.List;

public class PollResponse {
    private Long id;
    private String title;
    private String category;
    private Boolean isAnonymous;
    private Long createdBy;
    private Long totalVotes;
    private Boolean hasVoted;
    private Long userVotedOptionId;
    private List<PollOptionDto> options;
    private LocalDateTime createdAt;

    public PollResponse() {}

    public PollResponse(Long id, String title, String category, Boolean isAnonymous, Long createdBy, Long totalVotes, Boolean hasVoted, Long userVotedOptionId, List<PollOptionDto> options, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.isAnonymous = isAnonymous;
        this.createdBy = createdBy;
        this.totalVotes = totalVotes;
        this.hasVoted = hasVoted;
        this.userVotedOptionId = userVotedOptionId;
        this.options = options;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean isAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public Boolean getHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(Boolean hasVoted) {
        this.hasVoted = hasVoted;
    }

    public Long getUserVotedOptionId() {
        return userVotedOptionId;
    }

    public void setUserVotedOptionId(Long userVotedOptionId) {
        this.userVotedOptionId = userVotedOptionId;
    }

    public List<PollOptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<PollOptionDto> options) {
        this.options = options;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static PollResponseBuilder builder() {
        return new PollResponseBuilder();
    }

    public static class PollResponseBuilder {
        private Long id;
        private String title;
        private String category;
        private Boolean isAnonymous;
        private Long createdBy;
        private Long totalVotes;
        private Boolean hasVoted;
        private Long userVotedOptionId;
        private List<PollOptionDto> options;
        private LocalDateTime createdAt;

        public PollResponseBuilder() {}

        public PollResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PollResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public PollResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public PollResponseBuilder isAnonymous(Boolean isAnonymous) {
            this.isAnonymous = isAnonymous;
            return this;
        }

        public PollResponseBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public PollResponseBuilder totalVotes(Long totalVotes) {
            this.totalVotes = totalVotes;
            return this;
        }

        public PollResponseBuilder hasVoted(Boolean hasVoted) {
            this.hasVoted = hasVoted;
            return this;
        }

        public PollResponseBuilder userVotedOptionId(Long userVotedOptionId) {
            this.userVotedOptionId = userVotedOptionId;
            return this;
        }

        public PollResponseBuilder options(List<PollOptionDto> options) {
            this.options = options;
            return this;
        }

        public PollResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PollResponse build() {
            return new PollResponse(this.id, this.title, this.category, this.isAnonymous, this.createdBy, this.totalVotes, this.hasVoted, this.userVotedOptionId, this.options, this.createdAt);
        }
    }

}
