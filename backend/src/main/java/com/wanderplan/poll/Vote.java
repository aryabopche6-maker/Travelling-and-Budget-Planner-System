package com.wanderplan.poll;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"poll_id", "user_id"})
})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private PollOption option;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Vote() {}

    public Vote(Long id, Poll poll, PollOption option, Long userId, LocalDateTime createdAt) {
        this.id = id;
        this.poll = poll;
        this.option = option;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public PollOption getOption() {
        return option;
    }

    public void setOption(PollOption option) {
        this.option = option;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static VoteBuilder builder() {
        return new VoteBuilder();
    }

    public static class VoteBuilder {
        private Long id;
        private Poll poll;
        private PollOption option;
        private Long userId;
        private LocalDateTime createdAt;

        public VoteBuilder() {}

        public VoteBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public VoteBuilder poll(Poll poll) {
            this.poll = poll;
            return this;
        }

        public VoteBuilder option(PollOption option) {
            this.option = option;
            return this;
        }

        public VoteBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public VoteBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Vote build() {
            return new Vote(this.id, this.poll, this.option, this.userId, this.createdAt);
        }
    }

}
