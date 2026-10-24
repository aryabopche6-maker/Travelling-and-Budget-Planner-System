package com.wanderplan.budget;

import com.wanderplan.expense.Expense;
import com.wanderplan.expense.ExpenseRepository;
import com.wanderplan.hotel.HotelService;
import com.wanderplan.itinerary.ItineraryService;
import com.wanderplan.itinerary.TripSelectedPlaceRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private TripRepository tripRepository;
    @Mock private HiddenCostRepository hiddenCostRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private TripService tripService;
    @Mock private HotelService hotelService;
    @Mock private ItineraryService itineraryService;
    @Mock private TripSelectedPlaceRepository selectedPlaceRepository;

    @InjectMocks private BudgetService budgetService;

    @Test
    void spentUsesRecordedExpensesAndExcludesRejectedEntries() {
        Trip trip = Trip.builder().id(7L).destination("Lisbon").budget(1000.0).build();
        when(tripRepository.findById(7L)).thenReturn(Optional.of(trip));
        when(hiddenCostRepository.findByTripId(7L)).thenReturn(List.of());
        when(itineraryService.getSelectedHotel(7L, 3L)).thenReturn(Optional.empty());
        when(expenseRepository.findByTripId(7L)).thenReturn(List.of(
                Expense.builder().trip(trip).amount(125.50).status("ACCEPTED").build(),
                Expense.builder().trip(trip).amount(50.0).status("REJECTED").build()));

        BudgetResponse response = budgetService.getTripBudget(7L, 3L);

        assertEquals(125.50, response.getSpent());
        assertEquals(874.50, response.getRemainingBudget());
        verify(tripService).validateTripMembership(7L, 3L);
    }
}
