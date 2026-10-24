package com.wanderplan.trip;

import com.wanderplan.expense.ExpenseRepository;
import com.wanderplan.itinerary.ItineraryDayRepository;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.preference.PreferenceRepository;
import com.wanderplan.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock private TripRepository tripRepository;
    @Mock private TripMemberRepository tripMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private PreferenceRepository preferenceRepository;
    @Mock private ItineraryDayRepository itineraryDayRepository;
    @Mock private TripCleanupService tripCleanupService;
    @Mock private ExpenseRepository expenseRepository;

    @InjectMocks private TripService tripService;

    @Test
    void tripResponseIncludesRecordedSpending() {
        Trip trip = Trip.builder().id(7L).destination("Lisbon").budget(1000.0).build();
        when(tripMemberRepository.findByTripId(7L)).thenReturn(List.of());
        when(preferenceRepository.findByTripId(7L)).thenReturn(List.of());
        when(expenseRepository.sumNonRejectedAmountByTripId(7L)).thenReturn(125.50);

        TripResponse response = tripService.mapToTripResponse(trip);

        assertEquals(125.50, response.getSpent());
    }
}
