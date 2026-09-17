package com.wanderplan.expense;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ExpenseResponse {
    private Long id;
    private String title;
    private Double amount;
    private Long paidBy;
    private String paidByName;
    private LocalDate date;
    private String category;
    private String paymentMethod;
    private String splitType;
    private String proofUrl;
    private String status;
    private String disputeReason;
    private List<ExpenseSplitDto> splits;
    private LocalDateTime createdAt;

    public ExpenseResponse() {}

    public ExpenseResponse(Long id, String title, Double amount, Long paidBy, String paidByName, LocalDate date, String category, String paymentMethod, String splitType, String proofUrl, String status, String disputeReason, List<ExpenseSplitDto> splits, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.paidBy = paidBy;
        this.paidByName = paidByName;
        this.date = date;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.splitType = splitType;
        this.proofUrl = proofUrl;
        this.status = status;
        this.disputeReason = disputeReason;
        this.splits = splits;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(Long paidBy) {
        this.paidBy = paidBy;
    }

    public String getPaidByName() {
        return paidByName;
    }

    public void setPaidByName(String paidByName) {
        this.paidByName = paidByName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public String getProofUrl() {
        return proofUrl;
    }

    public void setProofUrl(String proofUrl) {
        this.proofUrl = proofUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public List<ExpenseSplitDto> getSplits() {
        return splits;
    }

    public void setSplits(List<ExpenseSplitDto> splits) {
        this.splits = splits;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static ExpenseResponseBuilder builder() {
        return new ExpenseResponseBuilder();
    }

    public static class ExpenseResponseBuilder {
        private Long id;
        private String title;
        private Double amount;
        private Long paidBy;
        private String paidByName;
        private LocalDate date;
        private String category;
        private String paymentMethod;
        private String splitType;
        private String proofUrl;
        private String status;
        private String disputeReason;
        private List<ExpenseSplitDto> splits;
        private LocalDateTime createdAt;

        public ExpenseResponseBuilder() {}

        public ExpenseResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ExpenseResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ExpenseResponseBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public ExpenseResponseBuilder paidBy(Long paidBy) {
            this.paidBy = paidBy;
            return this;
        }

        public ExpenseResponseBuilder paidByName(String paidByName) {
            this.paidByName = paidByName;
            return this;
        }

        public ExpenseResponseBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ExpenseResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public ExpenseResponseBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public ExpenseResponseBuilder splitType(String splitType) {
            this.splitType = splitType;
            return this;
        }

        public ExpenseResponseBuilder proofUrl(String proofUrl) {
            this.proofUrl = proofUrl;
            return this;
        }

        public ExpenseResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ExpenseResponseBuilder disputeReason(String disputeReason) {
            this.disputeReason = disputeReason;
            return this;
        }

        public ExpenseResponseBuilder splits(List<ExpenseSplitDto> splits) {
            this.splits = splits;
            return this;
        }

        public ExpenseResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ExpenseResponse build() {
            return new ExpenseResponse(this.id, this.title, this.amount, this.paidBy, this.paidByName, this.date, this.category, this.paymentMethod, this.splitType, this.proofUrl, this.status, this.disputeReason, this.splits, this.createdAt);
        }
    }

}
