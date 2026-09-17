package com.wanderplan.member;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MemberResponse> members = memberService.getTripMembers(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Members retrieved", members));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<MemberResponse>> inviteMember(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody InviteMemberRequest request) {
        MemberResponse response = memberService.inviteMember(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Member invited successfully", response));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long tripId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        memberService.removeMember(tripId, memberId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully"));
    }
}
