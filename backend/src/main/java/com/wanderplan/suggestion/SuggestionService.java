package com.wanderplan.suggestion;

import com.wanderplan.activity.ActivityFeedService;
import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuggestionService {

    @Autowired
    private TripSuggestionRepository suggestionRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private ActivityFeedService activityFeedService;

    @Transactional
    public SuggestionResponse createSuggestion(Long tripId, Long userId, CreateSuggestionRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TripSuggestion suggestion = TripSuggestion.builder()
                .trip(trip)
                .suggestedBy(userId)
                .suggestedByName(user.getName())
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .estimatedCost(request.getEstimatedCost())
                .status("PENDING")
                .build();

        suggestion = suggestionRepository.save(suggestion);

        // Log activity
        activityFeedService.logActivity(tripId, userId, user.getName(),
                "SUGGESTION_ADDED",
                user.getName() + " suggested \"" + request.getTitle() + "\" (" + request.getType() + ")",
                "Lightbulb", "SUGGESTION");

        return mapToResponse(suggestion);
    }

    public List<SuggestionResponse> getTripSuggestions(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return suggestionRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SuggestionResponse reviewSuggestion(Long tripId, Long suggestionId, Long adminUserId, ReviewSuggestionRequest request) {
        tripService.validateTripAdmin(tripId, adminUserId);

        TripSuggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found"));

        if (!suggestion.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Suggestion does not belong to this trip");
        }

        if (!"PENDING".equals(suggestion.getStatus())) {
            throw new BadRequestException("Suggestion has already been reviewed");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        String action = request.getAction().toUpperCase();
        if (!"APPROVE".equals(action) && !"REJECT".equals(action)) {
            throw new BadRequestException("Invalid action. Must be APPROVE or REJECT");
        }

        String newStatus = "APPROVE".equals(action) ? "APPROVED" : "REJECTED";
        suggestion.setStatus(newStatus);
        suggestion.setAdminNote(request.getAdminNote());
        suggestion.setReviewedBy(adminUserId);
        suggestion.setReviewedAt(LocalDateTime.now());

        suggestion = suggestionRepository.save(suggestion);

        // Log activity
        activityFeedService.logActivity(tripId, adminUserId, admin.getName(),
                "SUGGESTION_" + newStatus,
                admin.getName() + " " + newStatus.toLowerCase() + " suggestion \"" + suggestion.getTitle() + "\"",
                "APPROVED".equals(newStatus) ? "CheckCircle" : "XCircle",
                "SUGGESTION");

        return mapToResponse(suggestion);
    }

    private SuggestionResponse mapToResponse(TripSuggestion s) {
        return SuggestionResponse.builder()
                .id(s.getId())
                .suggestedBy(s.getSuggestedBy())
                .suggestedByName(s.getSuggestedByName())
                .type(s.getType())
                .title(s.getTitle())
                .description(s.getDescription())
                .estimatedCost(s.getEstimatedCost())
                .status(s.getStatus())
                .adminNote(s.getAdminNote())
                .createdAt(s.getCreatedAt())
                .reviewedAt(s.getReviewedAt())
                .build();
    }
}
