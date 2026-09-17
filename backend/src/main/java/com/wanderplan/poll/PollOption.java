package com.wanderplan.poll;

import jakarta.persistence.*;

@Entity
@Table(name = "poll_options")
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @Column(nullable = false)
    private String optionText;

    public PollOption() {}

    public PollOption(Long id, Poll poll, String optionText) {
        this.id = id;
        this.poll = poll;
        this.optionText = optionText;
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

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public static PollOptionBuilder builder() {
        return new PollOptionBuilder();
    }

    public static class PollOptionBuilder {
        private Long id;
        private Poll poll;
        private String optionText;

        public PollOptionBuilder() {}

        public PollOptionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PollOptionBuilder poll(Poll poll) {
            this.poll = poll;
            return this;
        }

        public PollOptionBuilder optionText(String optionText) {
            this.optionText = optionText;
            return this;
        }

        public PollOption build() {
            return new PollOption(this.id, this.poll, this.optionText);
        }
    }

}
