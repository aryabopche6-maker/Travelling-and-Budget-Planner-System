package com.wanderplan.user;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.auth.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.getName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        user = userRepository.save(user);

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.deleteByUserId(userId);
    }

    public UserSettingsDto getSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapSettings(user);
    }

    public UserSettingsDto updateSettings(Long userId, UserSettingsDto settings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmailNotifications(settings.isEmailNotifications());
        user.setPushNotifications(settings.isPushNotifications());
        user.setSosAlertsEnabled(settings.isSosAlertsEnabled());
        user.setCurrency(settings.getCurrency() != null && !settings.getCurrency().isBlank() ? settings.getCurrency() : "INR");
        user.setEmergencyContactName(settings.getEmergencyContactName() != null ? settings.getEmergencyContactName() : "");
        user.setEmergencyContactPhone(settings.getEmergencyContactPhone() != null ? settings.getEmergencyContactPhone() : "");
        return mapSettings(userRepository.save(user));
    }

    private UserSettingsDto mapSettings(User user) {
        return UserSettingsDto.builder()
                .emailNotifications(user.getEmailNotifications() == null || user.getEmailNotifications())
                .pushNotifications(user.getPushNotifications() == null || user.getPushNotifications())
                .sosAlertsEnabled(user.getSosAlertsEnabled() == null || user.getSosAlertsEnabled())
                .currency(user.getCurrency() != null ? user.getCurrency() : "INR")
                .emergencyContactName(user.getEmergencyContactName() != null ? user.getEmergencyContactName() : "")
                .emergencyContactPhone(user.getEmergencyContactPhone() != null ? user.getEmergencyContactPhone() : "")
                .build();
    }
}
