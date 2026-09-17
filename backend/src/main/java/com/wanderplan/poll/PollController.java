package com.wanderplan.poll;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/polls")
public class PollController {

    @Autowired
    private PollService pollService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PollResponse>>> getPolls(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PollResponse> polls = pollService.getTripPolls(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Polls retrieved", polls));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PollResponse>> createPoll(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePollRequest request) {
        PollResponse poll = pollService.createPoll(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Poll created successfully", poll));
    }

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<ApiResponse<PollResponse>> castVote(
            @PathVariable Long tripId,
            @PathVariable Long pollId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody VoteRequest request) {
        PollResponse poll = pollService.castVote(tripId, pollId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Vote recorded successfully", poll));
    }
}
