package com.wanderplan.expense;

import jakarta.persistence.*;

@Entity
@Table(name = "expense_splits")
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private Double amount;

        private Boolean isPaid = false;

    public ExpenseSplit() {}

    public ExpenseSplit(Long id, Expense expense, Long userId, String userName, Double amount, Boolean isPaid) {
        this.id = id;
        this.expense = expense;
        this.userId = userId;
        this.userName = userName;
        this.amount = amount;
        this.isPaid = isPaid;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
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

    public static ExpenseSplitBuilder builder() {
        return new ExpenseSplitBuilder();
    }

    public static class ExpenseSplitBuilder {
        private Long id;
        private Expense expense;
        private Long userId;
        private String userName;
        private Double amount;
        private Boolean isPaid;

        public ExpenseSplitBuilder() {}

        public ExpenseSplitBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ExpenseSplitBuilder expense(Expense expense) {
            this.expense = expense;
            return this;
        }

        public ExpenseSplitBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ExpenseSplitBuilder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public ExpenseSplitBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public ExpenseSplitBuilder isPaid(Boolean isPaid) {
            this.isPaid = isPaid;
            return this;
        }

        public ExpenseSplit build() {
            return new ExpenseSplit(this.id, this.expense, this.userId, this.userName, this.amount, this.isPaid);
        }
    }

}
