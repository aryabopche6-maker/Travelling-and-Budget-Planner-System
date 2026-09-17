package com.wanderplan.expense;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Long paidBy;

    private String paidByName;

    private LocalDate date;

    private String category;

    private String paymentMethod;

        private String splitType = "EQUAL"; // EQUAL, CUSTOM

    private String proofUrl;

        private String status = "PENDING"; // PENDING, ACCEPTED, DISPUTED, REJECTED, SETTLED

    private String disputeReason;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<ExpenseSplit> splits = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Expense() {}

    public Expense(Long id, Trip trip, String title, Double amount, Long paidBy, String paidByName, LocalDate date, String category, String paymentMethod, String splitType, String proofUrl, String status, String disputeReason, List<ExpenseSplit> splits, LocalDateTime createdAt) {
        this.id = id;
        this.trip = trip;
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

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
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

    public List<ExpenseSplit> getSplits() {
        return splits;
    }

    public void setSplits(List<ExpenseSplit> splits) {
        this.splits = splits;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static ExpenseBuilder builder() {
        return new ExpenseBuilder();
    }

    public static class ExpenseBuilder {
        private Long id;
        private Trip trip;
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
        private List<ExpenseSplit> splits;
        private LocalDateTime createdAt;

        public ExpenseBuilder() {}

        public ExpenseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ExpenseBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public ExpenseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ExpenseBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public ExpenseBuilder paidBy(Long paidBy) {
            this.paidBy = paidBy;
            return this;
        }

        public ExpenseBuilder paidByName(String paidByName) {
            this.paidByName = paidByName;
            return this;
        }

        public ExpenseBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ExpenseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public ExpenseBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public ExpenseBuilder splitType(String splitType) {
            this.splitType = splitType;
            return this;
        }

        public ExpenseBuilder proofUrl(String proofUrl) {
            this.proofUrl = proofUrl;
            return this;
        }

        public ExpenseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ExpenseBuilder disputeReason(String disputeReason) {
            this.disputeReason = disputeReason;
            return this;
        }

        public ExpenseBuilder splits(List<ExpenseSplit> splits) {
            this.splits = splits;
            return this;
        }

        public ExpenseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Expense build() {
            return new Expense(this.id, this.trip, this.title, this.amount, this.paidBy, this.paidByName, this.date, this.category, this.paymentMethod, this.splitType, this.proofUrl, this.status, this.disputeReason, this.splits, this.createdAt);
        }
    }

}
