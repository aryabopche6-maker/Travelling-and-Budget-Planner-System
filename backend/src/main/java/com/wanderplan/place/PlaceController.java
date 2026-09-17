package com.wanderplan.place;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/places")
public class PlaceController {

    @Autowired
    private PlaceService placeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlaces(
            @PathVariable Long tripId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "5") int radius,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PlaceResponse> places = placeService.getPlacesForTrip(tripId, userPrincipal.getId(), location, radius);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("places", places);
        responseData.put("isExternalConfigured", placeService.isExternalApiConfigured());

        return ResponseEntity.ok(ApiResponse.success("Places retrieved", responseData));
    }
}
