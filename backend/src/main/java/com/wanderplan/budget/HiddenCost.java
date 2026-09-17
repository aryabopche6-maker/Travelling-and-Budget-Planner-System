package com.wanderplan.budget;

import com.wanderplan.trip.Trip;
import jakarta.persistence.*;

@Entity
@Table(name = "hidden_costs")
public class HiddenCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String category; // Toll, Parking, Local transport, Taxes, Snacks, Emergency

    private String description;

    @Column(nullable = false)
    private Double estimatedCost;

        private Boolean isEstimate = true;

    public HiddenCost() {}

    public HiddenCost(Long id, Trip trip, String category, String description, Double estimatedCost, Boolean isEstimate) {
        this.id = id;
        this.trip = trip;
        this.category = category;
        this.description = description;
        this.estimatedCost = estimatedCost;
        this.isEstimate = isEstimate;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public Boolean isEstimate() {
        return isEstimate;
    }

    public Boolean getIsEstimate() {
        return isEstimate;
    }

    public void setIsEstimate(Boolean isEstimate) {
        this.isEstimate = isEstimate;
    }

    public static HiddenCostBuilder builder() {
        return new HiddenCostBuilder();
    }

    public static class HiddenCostBuilder {
        private Long id;
        private Trip trip;
        private String category;
        private String description;
        private Double estimatedCost;
        private Boolean isEstimate;

        public HiddenCostBuilder() {}

        public HiddenCostBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HiddenCostBuilder trip(Trip trip) {
            this.trip = trip;
            return this;
        }

        public HiddenCostBuilder category(String category) {
            this.category = category;
            return this;
        }

        public HiddenCostBuilder description(String description) {
            this.description = description;
            return this;
        }

        public HiddenCostBuilder estimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
            return this;
        }

        public HiddenCostBuilder isEstimate(Boolean isEstimate) {
            this.isEstimate = isEstimate;
            return this;
        }

        public HiddenCost build() {
            return new HiddenCost(this.id, this.trip, this.category, this.description, this.estimatedCost, this.isEstimate);
        }
    }

}
