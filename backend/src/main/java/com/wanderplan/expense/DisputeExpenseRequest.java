package com.wanderplan.expense;

import jakarta.validation.constraints.NotBlank;

public class DisputeExpenseRequest {
    @NotBlank(message = "Dispute reason is required")
    private String reason;

    public DisputeExpenseRequest() {}

    public DisputeExpenseRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}
