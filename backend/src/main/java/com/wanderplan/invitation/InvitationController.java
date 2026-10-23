package com.wanderplan.invitation;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    @PostMapping("/trips/{tripId}/invitations/link")
    public ResponseEntity<ApiResponse<InvitationResponse>> createShareInvitation(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InvitationResponse response = invitationService.createShareInvitation(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Shareable invitation link is ready", response));
    }

    @PostMapping("/trips/{tripId}/invitations/{invitationId}/link")
    public ResponseEntity<ApiResponse<InvitationResponse>> refreshShareInvitation(
            @PathVariable Long tripId,
            @PathVariable Long invitationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InvitationResponse response = invitationService.refreshShareInvitation(tripId, invitationId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("New shareable invitation link is ready", response));
    }

    @PostMapping("/trips/{tripId}/invitations")
    public ResponseEntity<ApiResponse<InvitationResponse>> sendInvitation(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SendInvitationRequest request) {
        InvitationResponse response = invitationService.sendInvitation(tripId, userPrincipal.getId(), request);
            String message = Boolean.TRUE.equals(response.getEmailSent())
                    ? "Invitation email sent successfully"
                    : "Invitation created, but email delivery failed. Share the invitation link manually.";
            return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @GetMapping("/trips/{tripId}/invitations")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getTripInvitations(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<InvitationResponse> invitations = invitationService.getTripInvitations(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip invitations retrieved", invitations));
    }

    @DeleteMapping("/trips/{tripId}/invitations/{invitationId}")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @PathVariable Long tripId,
            @PathVariable Long invitationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        invitationService.cancelInvitation(tripId, invitationId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Invitation cancelled successfully"));
    }

    @PostMapping("/trips/{tripId}/invitations/{invitationId}/resend")
    public ResponseEntity<ApiResponse<InvitationResponse>> resendInvitation(
            @PathVariable Long tripId,
            @PathVariable Long invitationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InvitationResponse response = invitationService.resendInvitation(tripId, invitationId, userPrincipal.getId());
        String message = Boolean.TRUE.equals(response.getEmailSent())
                ? "Invitation email resent successfully"
                : "Invitation recreated, but email delivery failed. Share the invitation link manually.";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @GetMapping("/invitations/verify")
    public ResponseEntity<ApiResponse<InvitationDetailResponse>> verifyInvitation(
            @RequestParam String token) {
        InvitationDetailResponse response = invitationService.verifyInvitationToken(token);
        return ResponseEntity.ok(ApiResponse.success("Invitation verified", response));
    }

    @PostMapping("/invitations/accept")
    public ResponseEntity<ApiResponse<InvitationResponse>> acceptInvitation(
            @RequestParam String token,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InvitationResponse response = invitationService.acceptInvitation(token, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Invitation accepted! You have joined the trip.", response));
    }

    @PostMapping("/invitations/decline")
    public ResponseEntity<ApiResponse<Void>> declineInvitation(
            @RequestParam String token) {
        invitationService.declineInvitation(token);
        return ResponseEntity.ok(ApiResponse.success("Invitation declined successfully"));
    }
}
