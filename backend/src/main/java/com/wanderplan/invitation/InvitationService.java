package com.wanderplan.invitation;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.mail.EmailService;
import com.wanderplan.member.TripMember;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvitationService {

    @Autowired
    private TripInvitationRepository invitationRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private EmailService emailService;

    @Value("${app.invitation.expiry-days:7}")
    private int expiryDays;

    @Transactional
    public InvitationResponse sendInvitation(Long tripId, Long adminUserId, SendInvitationRequest request) {
        tripService.validateTripAdmin(tripId, adminUserId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Check if user is already an active member of this trip
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            if (tripMemberRepository.existsByTripIdAndUserId(tripId, user.getId())) {
                throw new BadRequestException("User (" + normalizedEmail + ") is already a member of this trip.");
            }
        });

        // 2. Prevent duplicate pending invitations for the same trip and email
        if (invitationRepository.existsByTripIdAndInvitedEmailAndStatus(tripId, normalizedEmail, InvitationStatus.PENDING)) {
            throw new BadRequestException("A pending invitation has already been sent to " + normalizedEmail);
        }

        // 3. Generate secure expiring invitation token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(expiryDays);

        TripInvitation invitation = TripInvitation.builder()
                .trip(trip)
                .invitedEmail(normalizedEmail)
                .invitedBy(adminUser)
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        invitation = invitationRepository.save(invitation);

        // 4. Dispatch actual email
        emailService.sendTripInvitationEmail(invitation);

        return mapToResponse(invitation);
    }

    public List<InvitationResponse> getTripInvitations(Long tripId, Long adminUserId) {
        tripService.validateTripAdmin(tripId, adminUserId);
        return invitationRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelInvitation(Long tripId, Long invitationId, Long adminUserId) {
        tripService.validateTripAdmin(tripId, adminUserId);

        TripInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Invitation does not belong to this trip");
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
    }

    public InvitationDetailResponse verifyInvitationToken(String token) {
        TripInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation token"));

        boolean isExpired = invitation.isExpired();
        if (isExpired && invitation.getStatus() == InvitationStatus.PENDING) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
        }

        boolean requiresSignup = !userRepository.existsByEmail(invitation.getInvitedEmail());
        Trip trip = invitation.getTrip();

        return InvitationDetailResponse.builder()
                .token(invitation.getToken())
                .tripId(trip.getId())
                .destination(trip.getDestination())
                .startingLocation(trip.getStartingLocation())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .invitedEmail(invitation.getInvitedEmail())
                .invitedByName(invitation.getInvitedBy() != null ? invitation.getInvitedBy().getName() : "A friend")
                .status(invitation.getStatus())
                .isExpired(isExpired)
                .requiresSignup(requiresSignup)
                .expiresAt(invitation.getExpiresAt())
                .build();
    }

    @Transactional
    public InvitationResponse acceptInvitation(String token, Long currentUserId) {
        TripInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation token"));

        if (invitation.isExpired() || invitation.getStatus() == InvitationStatus.EXPIRED) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new BadRequestException("This invitation has expired. Please ask the Trip Admin to send a new invite.");
        }

        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            throw new BadRequestException("This invitation has already been accepted.");
        }

        if (invitation.getStatus() == InvitationStatus.CANCELLED) {
            throw new BadRequestException("This invitation has been cancelled by the Trip Admin.");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Security Rule 2: Ensure authenticated user's email strictly matches the invited email
        if (!currentUser.getEmail().trim().equalsIgnoreCase(invitation.getInvitedEmail().trim())) {
            throw new BadRequestException("This invitation was sent to " + invitation.getInvitedEmail() +
                    ". You are currently logged in as " + currentUser.getEmail() +
                    ". Please log in with the invited email account to accept.");
        }

        Trip trip = invitation.getTrip();

        // Check if member already exists
        if (!tripMemberRepository.existsByTripIdAndUserId(trip.getId(), currentUser.getId())) {
            TripMember member = TripMember.builder()
                    .trip(trip)
                    .user(currentUser)
                    .isTripAdmin(false)
                    .status("ACCEPTED")
                    .build();
            tripMemberRepository.save(member);
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation = invitationRepository.save(invitation);

        return mapToResponse(invitation);
    }

    @Transactional
    public void declineInvitation(String token) {
        TripInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation token"));

        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            throw new BadRequestException("Cannot decline an invitation that has already been accepted.");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(invitation);
    }

    private InvitationResponse mapToResponse(TripInvitation inv) {
        return InvitationResponse.builder()
                .id(inv.getId())
                .tripId(inv.getTrip().getId())
                .destination(inv.getTrip().getDestination())
                .invitedEmail(inv.getInvitedEmail())
                .invitedByName(inv.getInvitedBy() != null ? inv.getInvitedBy().getName() : "Trip Admin")
                .status(inv.getStatus())
                .createdAt(inv.getCreatedAt())
                .expiresAt(inv.getExpiresAt())
                .build();
    }
}
