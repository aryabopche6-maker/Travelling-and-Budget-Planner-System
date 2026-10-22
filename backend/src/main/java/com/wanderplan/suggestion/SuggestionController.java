package com.wanderplan.suggestion;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SuggestionResponse>>> getSuggestions(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SuggestionResponse> suggestions = suggestionService.getTripSuggestions(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved", suggestions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SuggestionResponse>> createSuggestion(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateSuggestionRequest request) {
        SuggestionResponse suggestion = suggestionService.createSuggestion(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Suggestion submitted successfully", suggestion));
    }

    @PutMapping("/{suggestionId}/review")
    public ResponseEntity<ApiResponse<SuggestionResponse>> reviewSuggestion(
            @PathVariable Long tripId,
            @PathVariable Long suggestionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ReviewSuggestionRequest request) {
        SuggestionResponse suggestion = suggestionService.reviewSuggestion(tripId, suggestionId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Suggestion reviewed successfully", suggestion));
    }
}
