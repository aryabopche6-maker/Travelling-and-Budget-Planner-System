package com.wanderplan.hotel;

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
@RequestMapping("/api/trips/{tripId}/hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHotels(
            @PathVariable Long tripId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "5") int radius,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<HotelResponse> hotels = hotelService.getHotelsForTrip(tripId, userPrincipal.getId(), location, radius);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("hotels", hotels);
        responseData.put("isExternalConfigured", hotelService.isExternalApiConfigured());

        return ResponseEntity.ok(ApiResponse.success("Hotel recommendations retrieved", responseData));
    }
}
