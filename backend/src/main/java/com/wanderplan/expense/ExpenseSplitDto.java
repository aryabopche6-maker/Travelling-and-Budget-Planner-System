package com.wanderplan.expense;


public class ExpenseSplitDto {
    private Long userId;
    private String userName;
    private Double amount;
    private Boolean isPaid;

    public ExpenseSplitDto() {}

    public ExpenseSplitDto(Long userId, String userName, Double amount, Boolean isPaid) {
        this.userId = userId;
        this.userName = userName;
        this.amount = amount;
        this.isPaid = isPaid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Boolean isPaid() {
        return isPaid;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public static ExpenseSplitDtoBuilder builder() {
        return new ExpenseSplitDtoBuilder();
    }

    public static class ExpenseSplitDtoBuilder {
        private Long userId;
        private String userName;
        private Double amount;
        private Boolean isPaid;

        public ExpenseSplitDtoBuilder() {}

        public ExpenseSplitDtoBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ExpenseSplitDtoBuilder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public ExpenseSplitDtoBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public ExpenseSplitDtoBuilder isPaid(Boolean isPaid) {
            this.isPaid = isPaid;
            return this;
        }

        public ExpenseSplitDto build() {
            return new ExpenseSplitDto(this.userId, this.userName, this.amount, this.isPaid);
        }
    }

}
