package com.wanderplan.sos;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/sos")
public class SOSController {

    @Autowired
    private SOSService sosService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SOSResponse>>> getSOSAlerts(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SOSResponse> alerts = sosService.getTripSOSAlerts(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("SOS alerts retrieved", alerts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SOSResponse>> triggerSOS(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SOSRequest request) {
        SOSResponse alert = sosService.triggerSOS(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("SOS Alert activated!", alert));
    }

    @PutMapping("/{sosId}/location")
    public ResponseEntity<ApiResponse<SOSResponse>> updateLocation(
            @PathVariable Long tripId,
            @PathVariable Long sosId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody LocationUpdateRequest request) {
        SOSResponse alert = sosService.updateLocation(tripId, sosId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Location updated", alert));
    }

    @PostMapping("/{sosId}/safe")
    public ResponseEntity<ApiResponse<SOSResponse>> markSafe(
            @PathVariable Long tripId,
            @PathVariable Long sosId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SOSResponse alert = sosService.markSafe(tripId, sosId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Status updated to SAFE", alert));
    }
}
