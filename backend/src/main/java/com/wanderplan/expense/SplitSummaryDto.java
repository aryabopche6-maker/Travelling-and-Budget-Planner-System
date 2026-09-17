package com.wanderplan.expense;


import java.util.List;

public class SplitSummaryDto {
    private Double totalExpense;
    private Double myTotalPaid;
    private Double myTotalOwed;
    private Double netBalance; // Positive = to receive, Negative = to pay
    private List<ExpenseResponse> expenses;

    public SplitSummaryDto() {}

    public SplitSummaryDto(Double totalExpense, Double myTotalPaid, Double myTotalOwed, Double netBalance, List<ExpenseResponse> expenses) {
        this.totalExpense = totalExpense;
        this.myTotalPaid = myTotalPaid;
        this.myTotalOwed = myTotalOwed;
        this.netBalance = netBalance;
        this.expenses = expenses;
    }

    public Double getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(Double totalExpense) {
        this.totalExpense = totalExpense;
    }

    public Double getMyTotalPaid() {
        return myTotalPaid;
    }

    public void setMyTotalPaid(Double myTotalPaid) {
        this.myTotalPaid = myTotalPaid;
    }

    public Double getMyTotalOwed() {
        return myTotalOwed;
    }

    public void setMyTotalOwed(Double myTotalOwed) {
        this.myTotalOwed = myTotalOwed;
    }

    public Double getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(Double netBalance) {
        this.netBalance = netBalance;
    }

    public List<ExpenseResponse> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<ExpenseResponse> expenses) {
        this.expenses = expenses;
    }

    public static SplitSummaryDtoBuilder builder() {
        return new SplitSummaryDtoBuilder();
    }

    public static class SplitSummaryDtoBuilder {
        private Double totalExpense;
        private Double myTotalPaid;
        private Double myTotalOwed;
        private Double netBalance;
        private List<ExpenseResponse> expenses;

        public SplitSummaryDtoBuilder() {}

        public SplitSummaryDtoBuilder totalExpense(Double totalExpense) {
            this.totalExpense = totalExpense;
            return this;
        }

        public SplitSummaryDtoBuilder myTotalPaid(Double myTotalPaid) {
            this.myTotalPaid = myTotalPaid;
            return this;
        }

        public SplitSummaryDtoBuilder myTotalOwed(Double myTotalOwed) {
            this.myTotalOwed = myTotalOwed;
            return this;
        }

        public SplitSummaryDtoBuilder netBalance(Double netBalance) {
            this.netBalance = netBalance;
            return this;
        }

        public SplitSummaryDtoBuilder expenses(List<ExpenseResponse> expenses) {
            this.expenses = expenses;
            return this;
        }

        public SplitSummaryDto build() {
            return new SplitSummaryDto(this.totalExpense, this.myTotalPaid, this.myTotalOwed, this.netBalance, this.expenses);
        }
    }

}
