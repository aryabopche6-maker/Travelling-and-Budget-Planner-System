package com.wanderplan.auth;

import com.wanderplan.mail.EmailService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServicePasswordResetTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    @Test
    void forgotPasswordPersistsOnlyHashedTokenAndSendsRawTokenByEmail() {
        User user = User.builder().id(5L).name("Traveler").email("traveler@example.test").build();
        when(userRepository.findByEmailIgnoreCase("traveler@example.test")).thenReturn(Optional.of(user));
        ReflectionTestUtils.setField(authService, "resetTokenExpiryMinutes", 30L);

        authService.forgotPassword("traveler@example.test");

        ArgumentCaptor<PasswordResetToken> savedToken = ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<String> emailedToken = ArgumentCaptor.forClass(String.class);
        verify(passwordResetTokenRepository).save(savedToken.capture());
        verify(emailService).sendPasswordResetEmail(eq(user.getEmail()), eq(user.getName()), emailedToken.capture());
        assertEquals(64, savedToken.getValue().getTokenHash().length());
        assertNotEquals(emailedToken.getValue(), savedToken.getValue().getTokenHash());
        assertTrue(savedToken.getValue().getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void unknownForgotPasswordAddressDoesNotCreateTokenOrSendEmail() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.test")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.forgotPassword("unknown@example.test"));

        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }
}
