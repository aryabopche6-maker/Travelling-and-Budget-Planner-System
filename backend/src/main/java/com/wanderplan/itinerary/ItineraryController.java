package com.wanderplan.itinerary;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips/{tripId}")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @GetMapping("/itinerary")
    public ResponseEntity<ApiResponse<ItineraryResponse>> getItinerary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ItineraryResponse itinerary = itineraryService.getItinerary(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Itinerary retrieved", itinerary));
    }

    @PostMapping("/itinerary/generate")
    public ResponseEntity<ApiResponse<ItineraryResponse>> generateItinerary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.generateInitialItinerary(tripId, userPrincipal.getId());
        ItineraryResponse itinerary = itineraryService.getItinerary(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Itinerary generated", itinerary));
    }

    @PostMapping("/itinerary/activities")
    public ResponseEntity<ApiResponse<ItineraryActivityDto>> addActivity(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ActivityRequest request) {
        ItineraryActivityDto activity = itineraryService.addActivity(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Activity added", activity));
    }

    @DeleteMapping("/itinerary/activities/{activityId}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(
            @PathVariable Long tripId,
            @PathVariable Long activityId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.deleteActivity(tripId, activityId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Activity deleted"));
    }

    // --- Place Selection Endpoints ---
    @GetMapping("/selected-places")
    public ResponseEntity<ApiResponse<List<TripSelectedPlace>>> getSelectedPlaces(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TripSelectedPlace> places = itineraryService.getSelectedPlaces(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Selected places retrieved", places));
    }

    @PostMapping("/selected-places")
    public ResponseEntity<ApiResponse<TripSelectedPlace>> addSelectedPlace(
            @PathVariable Long tripId,
            @RequestBody TripSelectedPlace place,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TripSelectedPlace saved = itineraryService.addSelectedPlace(tripId, userPrincipal.getId(), place);
        return ResponseEntity.ok(ApiResponse.success("Place added to trip", saved));
    }

    @DeleteMapping("/selected-places/{name}")
    public ResponseEntity<ApiResponse<Void>> removeSelectedPlace(
            @PathVariable Long tripId,
            @PathVariable String name,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.removeSelectedPlace(tripId, userPrincipal.getId(), name);
        return ResponseEntity.ok(ApiResponse.success("Place removed from trip"));
    }

    // --- Hotel Selection Endpoints ---
    @GetMapping("/selected-hotel")
    public ResponseEntity<ApiResponse<TripSelectedHotel>> getSelectedHotel(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<TripSelectedHotel> hotel = itineraryService.getSelectedHotel(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Selected hotel retrieved", hotel.orElse(null)));
    }

    @PostMapping("/selected-hotel")
    public ResponseEntity<ApiResponse<TripSelectedHotel>> selectHotel(
            @PathVariable Long tripId,
            @RequestBody TripSelectedHotel hotel,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TripSelectedHotel saved = itineraryService.selectHotel(tripId, userPrincipal.getId(), hotel);
        return ResponseEntity.ok(ApiResponse.success("Hotel selected for trip", saved));
    }

    @DeleteMapping("/selected-hotel")
    public ResponseEntity<ApiResponse<Void>> removeSelectedHotel(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.removeSelectedHotel(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Hotel removed from trip"));
    }
}
