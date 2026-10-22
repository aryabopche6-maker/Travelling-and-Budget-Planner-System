package com.wanderplan.activity;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/activities")
public class ActivityFeedController {

    @Autowired
    private ActivityFeedService activityFeedService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityFeedResponse>>> getTripActivities(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ActivityFeedResponse> activities = activityFeedService.getTripActivities(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved", activities));
    }
}
