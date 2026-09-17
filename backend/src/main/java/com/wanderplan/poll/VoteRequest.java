package com.wanderplan.poll;

import jakarta.validation.constraints.NotNull;

public class VoteRequest {
    @NotNull(message = "Option ID is required")
    private Long optionId;

    public VoteRequest() {}

    public VoteRequest(Long optionId) {
        this.optionId = optionId;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

}
