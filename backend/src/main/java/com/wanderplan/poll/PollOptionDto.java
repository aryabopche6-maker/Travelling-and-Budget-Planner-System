package com.wanderplan.poll;


public class PollOptionDto {
    private Long id;
    private String text;
    private Long votesCount;
    private Double percentage;

    public PollOptionDto() {}

    public PollOptionDto(Long id, String text, Long votesCount, Double percentage) {
        this.id = id;
        this.text = text;
        this.votesCount = votesCount;
        this.percentage = percentage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Long getVotesCount() {
        return votesCount;
    }

    public void setVotesCount(Long votesCount) {
        this.votesCount = votesCount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public static PollOptionDtoBuilder builder() {
        return new PollOptionDtoBuilder();
    }

    public static class PollOptionDtoBuilder {
        private Long id;
        private String text;
        private Long votesCount;
        private Double percentage;

        public PollOptionDtoBuilder() {}

        public PollOptionDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PollOptionDtoBuilder text(String text) {
            this.text = text;
            return this;
        }

        public PollOptionDtoBuilder votesCount(Long votesCount) {
            this.votesCount = votesCount;
            return this;
        }

        public PollOptionDtoBuilder percentage(Double percentage) {
            this.percentage = percentage;
            return this;
        }

        public PollOptionDto build() {
            return new PollOptionDto(this.id, this.text, this.votesCount, this.percentage);
        }
    }

}
