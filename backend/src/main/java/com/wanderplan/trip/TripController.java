package com.wanderplan.trip;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateTripRequest request) {
        TripResponse trip = tripService.createTrip(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Trip created successfully", trip));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getMyTrips(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TripResponse> trips = tripService.getMyTrips(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("User trips retrieved", trips));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> getTripById(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TripResponse trip = tripService.getTripById(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip details retrieved", trip));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateTripRequest request) {
        TripResponse updated = tripService.updateTrip(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Trip updated successfully", updated));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        tripService.deleteTrip(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip deleted successfully"));
    }
}
