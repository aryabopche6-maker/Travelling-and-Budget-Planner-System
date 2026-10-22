package com.wanderplan.budget;

import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.hotel.HotelResponse;
import com.wanderplan.hotel.HotelService;
import com.wanderplan.itinerary.ItineraryService;
import com.wanderplan.itinerary.TripSelectedHotel;
import com.wanderplan.itinerary.TripSelectedPlace;
import com.wanderplan.itinerary.TripSelectedPlaceRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private HiddenCostRepository hiddenCostRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private HotelService hotelService;

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private TripSelectedPlaceRepository selectedPlaceRepository;

    public BudgetResponse getTripBudget(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        List<HiddenCost> hiddenCostsList = hiddenCostRepository.findByTripId(tripId);
        double hiddenCostTotal = hiddenCostsList.stream().mapToDouble(HiddenCost::getEstimatedCost).sum();

        double totalBudget = trip.getBudget() != null ? trip.getBudget() : 0.0;
        
        // Calculate nights
        long nights = 3;
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            nights = Math.max(1, ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()));
        }

        // Actual selected hotel cost if present
        Optional<TripSelectedHotel> selectedHotel = itineraryService.getSelectedHotel(tripId, userId);
        double hotelPerNight = selectedHotel.map(TripSelectedHotel::getPricePerNight).orElse((double) Math.round(totalBudget * 0.30) / Math.max(1, nights));
        double hotel = hotelPerNight * nights;

        // Dynamic breakdown based on trip budget & travelers
        double transport = Math.round(totalBudget * 0.30);
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

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        long nights = 3;
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            nights = Math.max(1, ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()));
        }

        List<AlternativeResponse> alternatives = new ArrayList<>();

        // 1. Hotel Alternative: compare current choice with a smarter budget stay
        Optional<TripSelectedHotel> currentHotelOpt = itineraryService.getSelectedHotel(tripId, userId);
        String currentHotelName = currentHotelOpt.map(TripSelectedHotel::getName).orElse("Taj Fort Aguada Resort & Spa");
        double currentHotelRate = currentHotelOpt.map(TripSelectedHotel::getPricePerNight).orElse(11500.0);
        double currentHotelTotal = currentHotelRate * nights;

        // Smart alternative hotel: e.g. Zostel Goa or Pousada by the Beach
        String altHotelName = "Pousada by the Beach";
        double altHotelRate = 3200.0;
        String altHotelType = "Guest House";
        String altLocation = "Calangute, " + trip.getDestination();
        String altImg = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

        // If current hotel is already budget, suggest an alternative charming boutique
        if (currentHotelName.toLowerCase().contains("pousada") || currentHotelName.toLowerCase().contains("zostel")) {
            altHotelName = "Novotel Goa Shrem Hotel";
            altHotelRate = 4200.0;
            altHotelType = "Hotel";
            altImg = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
        }

        double altHotelTotal = altHotelRate * nights;
        double hotelSavings = Math.max(1500.0, currentHotelTotal - altHotelTotal);

        alternatives.add(AlternativeResponse.builder()
                .id("alt-hotel-1")
                .category("Hotel")
                .currentOption(currentHotelName + " (₹" + (long)currentHotelRate + "/night)")
                .alternativeOption(altHotelName + " (₹" + (long)altHotelRate + "/night)")
                .currentCost(currentHotelTotal)
                .alternativeCost(altHotelTotal)
                .potentialSaving(hotelSavings)
                .impactDescription("Switching stay saves ₹" + (long)hotelSavings + " across " + nights + " nights without losing location convenience.")
                .alternativeName(altHotelName)
                .alternativeType(altHotelType)
                .alternativeLocation(altLocation)
                .alternativeRating(4.5)
                .alternativeImageUrl(altImg)
                .build());

        // 2. Transport Alternative
        String currentMode = trip.getTravelMode() != null ? trip.getTravelMode() : "flight";
        double currentTransportCost = currentMode.equalsIgnoreCase("flight") ? 18000.0 : 8000.0;
        double altTransportCost = currentMode.equalsIgnoreCase("flight") ? 4500.0 : 3000.0;
        String currentTransportLabel = currentMode.equalsIgnoreCase("flight") ? "Direct Air Flights (₹18,000)" : "Private Cab Ride (₹8,000)";
        String altTransportLabel = currentMode.equalsIgnoreCase("flight") ? "AC Tejas Express / Superfast Train (₹4,500)" : "Self-Drive Rental Car (₹3,000)";
        double transportSavings = currentTransportCost - altTransportCost;

        alternatives.add(AlternativeResponse.builder()
                .id("alt-transport-1")
                .category("Transport")
                .currentOption(currentTransportLabel)
                .alternativeOption(altTransportLabel)
                .currentCost(currentTransportCost)
                .alternativeCost(altTransportCost)
                .potentialSaving(transportSavings)
                .impactDescription("Saves ₹" + (long)transportSavings + " with scenic travel views and comfortable reserved seating.")
                .alternativeName(currentMode.equalsIgnoreCase("flight") ? "train" : "car")
                .build());

        // 3. Sightseeing / Activity Alternative
        alternatives.add(AlternativeResponse.builder()
                .id("alt-activity-1")
                .category("Activity")
                .currentOption("Private Yacht & VIP Dolphin Cruise (₹12,000)")
                .alternativeOption("State Tourism Catamaran Heritage Island Cruise (₹3,200)")
                .currentCost(12000.0)
                .alternativeCost(3200.0)
                .potentialSaving(8800.0)
                .impactDescription("Visits the same islands and dolphin points with certified safety guides, saving ₹8,800.")
                .alternativeName("Catamaran Island Cruise")
                .build());

        return alternatives;
    }

    @Transactional
    public void applyAlternative(Long tripId, Long userId, String alternativeId) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if ("alt-hotel-1".equals(alternativeId)) {
            // Apply alternative hotel to Trip & Itinerary
            TripSelectedHotel altHotel = TripSelectedHotel.builder()
                    .name("Pousada by the Beach")
                    .location("Calangute, " + trip.getDestination())
                    .hotelType("Guest House")
                    .pricePerNight(3200.0)
                    .currency("INR")
                    .rating(4.5)
                    .imageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
                    .build();

            itineraryService.selectHotel(tripId, userId, altHotel);
        } else if ("alt-transport-1".equals(alternativeId)) {
            // Update trip travel mode
            String newMode = "flight".equalsIgnoreCase(trip.getTravelMode()) ? "train" : "car";
            trip.setTravelMode(newMode);
            tripRepository.save(trip);
        }
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
