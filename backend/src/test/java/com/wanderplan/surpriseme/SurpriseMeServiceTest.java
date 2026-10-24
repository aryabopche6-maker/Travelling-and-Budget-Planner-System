package com.wanderplan.surpriseme;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SurpriseMeServiceTest {

    private final SurpriseMeService service = new SurpriseMeService();

    @Test
    void budgetAndInterestsSelectAnAffordableMatchingDestination() {
        SurpriseMeResponse response = service.generateSurpriseTrip(
                request(20_000, 2, 2, List.of("Beach", "Nightlife"), "active"));

        assertEquals("Goa", response.getSuggestedDestination());
        assertEquals(16_800.0, response.getEstimatedTotalBudget());
    }

    @Test
    void groupSizeChangesAffordabilityAndEstimatedTotal() {
        SurpriseMeResponse oneTraveler = service.generateSurpriseTrip(
                request(40_000, 2, 1, List.of("Beach"), "balanced"));
        SurpriseMeResponse twoTravelers = service.generateSurpriseTrip(
                request(40_000, 2, 2, List.of("Beach"), "balanced"));

        assertEquals("Bali", oneTraveler.getSuggestedDestination());
        assertEquals("Kerala", twoTravelers.getSuggestedDestination());
        assertEquals(21_000.0, oneTraveler.getEstimatedTotalBudget());
        assertEquals(22_400.0, twoTravelers.getEstimatedTotalBudget());
    }

    @Test
    void styleAndDurationAffectTheRecommendationAndActivityCount() {
        SurpriseMeResponse relaxedOneDay = service.generateSurpriseTrip(
                request(50_000, 1, 1, List.of(), "relaxed"));
        SurpriseMeResponse activeOneDay = service.generateSurpriseTrip(
                request(50_000, 1, 1, List.of(), "active"));
        SurpriseMeResponse relaxedFourDays = service.generateSurpriseTrip(
                request(50_000, 4, 1, List.of(), "relaxed"));

        assertEquals("Bali", relaxedOneDay.getSuggestedDestination());
        assertEquals("Goa", activeOneDay.getSuggestedDestination());
        assertEquals(1, relaxedOneDay.getSuggestedActivities().size());
        assertEquals(4, relaxedFourDays.getSuggestedActivities().size());
        assertEquals(42_000.0, relaxedFourDays.getEstimatedTotalBudget());
    }

    @Test
    void rejectsBudgetBelowTheMinimumEstimatedTripCost() {
        assertThrows(ResponseStatusException.class,
                () -> service.generateSurpriseTrip(request(1_000, 2, 2, List.of(), "balanced")));
    }

    private SurpriseMeRequest request(double budget, int days, int travelers, List<String> interests, String pace) {
        return new SurpriseMeRequest("Delhi", budget, days, travelers, interests, pace);
    }
}
