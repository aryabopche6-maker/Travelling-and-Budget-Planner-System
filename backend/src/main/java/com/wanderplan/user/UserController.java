package com.wanderplan.user;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserResponse user = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved", user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updated = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @GetMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettingsDto>> getSettings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserSettingsDto settings = userService.getSettings(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", settings));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateSettings(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserSettingsDto settings) {
        UserSettingsDto updated = userService.updateSettings(userPrincipal.getId(), settings);
        return ResponseEntity.ok(ApiResponse.success("Settings updated", updated));
    }
}
