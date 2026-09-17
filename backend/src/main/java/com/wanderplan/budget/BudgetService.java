package com.wanderplan.budget;

import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private HiddenCostRepository hiddenCostRepository;

    @Autowired
    private TripService tripService;

    public BudgetResponse getTripBudget(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        List<HiddenCost> hiddenCostsList = hiddenCostRepository.findByTripId(tripId);
        double hiddenCostTotal = hiddenCostsList.stream().mapToDouble(HiddenCost::getEstimatedCost).sum();

        double totalBudget = trip.getBudget() != null ? trip.getBudget() : 0.0;
        
        // Dynamic breakdown based on trip budget & travelers
        double transport = Math.round(totalBudget * 0.35);
        double hotel = Math.round(totalBudget * 0.30);
        double food = Math.round(totalBudget * 0.15);
        double activities = Math.round(totalBudget * 0.10);
        double totalSpent = transport + hotel + food + activities + hiddenCostTotal;
        double remainingBudget = totalBudget - totalSpent;
        double percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        String status = "WITHIN_BUDGET";
        if (totalSpent > totalBudget) {
            status = "OVER_BUDGET";
        } else if (percentage >= 85.0) {
            status = "BUDGET_TIGHT";
        }

        List<HiddenCostResponse> hiddenCostResponses = hiddenCostsList.stream().map(h -> HiddenCostResponse.builder()
                .id(h.getId())
                .category(h.getCategory())
                .description(h.getDescription())
                .estimatedCost(h.getEstimatedCost())
                .isEstimate(h.getIsEstimate())
                .build()).collect(Collectors.toList());

        return BudgetResponse.builder()
                .totalBudget(totalBudget)
                .transport(transport)
                .hotel(hotel)
                .food(food)
                .activities(activities)
                .hiddenCosts(hiddenCostTotal)
                .spent(totalSpent)
                .remainingBudget(remainingBudget)
                .budgetPercentage(Math.round(percentage * 100.0) / 100.0)
                .status(status)
                .hiddenCostItems(hiddenCostResponses)
                .build();
    }

    @Transactional
    public HiddenCostResponse addHiddenCost(Long tripId, Long userId, HiddenCostRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        HiddenCost hc = HiddenCost.builder()
                .trip(trip)
                .category(request.getCategory())
                .description(request.getDescription())
                .estimatedCost(request.getEstimatedCost())
                .isEstimate(request.getIsEstimate() != null ? request.getIsEstimate() : true)
                .build();

        hc = hiddenCostRepository.save(hc);

        return HiddenCostResponse.builder()
                .id(hc.getId())
                .category(hc.getCategory())
                .description(hc.getDescription())
                .estimatedCost(hc.getEstimatedCost())
                .isEstimate(hc.getIsEstimate())
                .build();
    }

    @Transactional
    public void deleteHiddenCost(Long tripId, Long costId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        hiddenCostRepository.deleteById(costId);
    }

    public SimulationResponse simulateBudget(Long tripId, Long userId, SimulationRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        double currentTotal = trip.getBudget() != null ? trip.getBudget() : 100000.0;
        double newTotal = request.getNewBudget() != null ? request.getNewBudget() : currentTotal;

        double difference = newTotal - currentTotal;
        double savings = difference < 0 ? Math.abs(difference) : 0;
        double additionalCost = difference > 0 ? difference : 0;

        List<String> recommendations = new ArrayList<>();
        if (difference < 0) {
            recommendations.add("Consider switching to a 3-star hotel to save ₹5,000");
            recommendations.add("Opt for train/bus instead of flight for regional segments");
        } else {
            recommendations.add("Budget increased! You can upgrade to a premium resort or add guided day tours.");
        }

        return SimulationResponse.builder()
                .currentTotal(currentTotal)
                .newTotal(newTotal)
                .difference(difference)
                .savings(savings)
                .additionalCost(additionalCost)
                .recommendations(recommendations)
                .build();
    }

    public List<AlternativeResponse> getAlternatives(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        List<AlternativeResponse> alternatives = new ArrayList<>();
        alternatives.add(AlternativeResponse.builder()
                .id("alt-1")
                .category("Hotel")
                .currentOption("4-Star Resort (₹8,000/night)")
                .alternativeOption("Boutique Hotel (₹4,500/night)")
                .currentCost(24000.0)
                .alternativeCost(13500.0)
                .potentialSaving(10500.0)
                .impactDescription("Saves ₹10,500 with high rated amenities")
                .build());

        alternatives.add(AlternativeResponse.builder()
                .id("alt-2")
                .category("Transport")
                .currentOption("Private Airport Taxi (₹2,500)")
                .alternativeOption("Express Airport Shuttle (₹400)")
                .currentCost(2500.0)
                .alternativeCost(400.0)
                .potentialSaving(2100.0)
                .impactDescription("Saves ₹2,100 per direction")
                .build());

        return alternatives;
    }

    public BudgetRescueResponse getBudgetRescue(Long tripId, Long userId) {
        BudgetResponse currentBudget = getTripBudget(tripId, userId);
        double overage = currentBudget.getSpent() > currentBudget.getTotalBudget()
                ? currentBudget.getSpent() - currentBudget.getTotalBudget()
                : 0.0;

        return BudgetRescueResponse.builder()
                .currentSpending(currentBudget.getSpent())
                .remainingBudget(currentBudget.getRemainingBudget())
                .expectedRemainingExpenses(15000.0)
                .predictedOverage(overage + 5000.0)
                .alertMessage(overage > 0 ? "You are currently exceeding your budget by ₹" + (long)overage : "Your budget is tight.")
                .rescueOptions(getAlternatives(tripId, userId))
                .build();
    }
}
