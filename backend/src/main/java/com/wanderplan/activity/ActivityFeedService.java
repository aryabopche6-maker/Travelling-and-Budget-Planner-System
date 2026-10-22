package com.wanderplan.activity;

import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityFeedService {

    @Autowired
    private ActivityFeedRepository activityFeedRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    public List<ActivityFeedResponse> getTripActivities(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return activityFeedRepository.findTop50ByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void logActivity(Long tripId, Long userId, String userName, String action, String description, String icon, String category) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return;

        ActivityFeed activity = ActivityFeed.builder()
                .trip(trip)
                .userId(userId)
                .userName(userName)
                .action(action)
                .description(description)
                .icon(icon)
                .category(category)
                .build();

        activityFeedRepository.save(activity);
    }

    private ActivityFeedResponse mapToResponse(ActivityFeed a) {
        return ActivityFeedResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .userName(a.getUserName())
                .action(a.getAction())
                .description(a.getDescription())
                .icon(a.getIcon())
                .category(a.getCategory())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
