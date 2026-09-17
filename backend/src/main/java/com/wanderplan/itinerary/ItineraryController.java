package com.wanderplan.itinerary;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/itinerary")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @GetMapping
    public ResponseEntity<ApiResponse<ItineraryResponse>> getItinerary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ItineraryResponse itinerary = itineraryService.getItinerary(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Itinerary retrieved", itinerary));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ItineraryResponse>> generateItinerary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.generateInitialItinerary(tripId);
        ItineraryResponse itinerary = itineraryService.getItinerary(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Itinerary generated", itinerary));
    }

    @PostMapping("/activities")
    public ResponseEntity<ApiResponse<ItineraryActivityDto>> addActivity(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ActivityRequest request) {
        ItineraryActivityDto activity = itineraryService.addActivity(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Activity added", activity));
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(
            @PathVariable Long tripId,
            @PathVariable Long activityId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        itineraryService.deleteActivity(tripId, activityId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Activity deleted"));
    }
}
