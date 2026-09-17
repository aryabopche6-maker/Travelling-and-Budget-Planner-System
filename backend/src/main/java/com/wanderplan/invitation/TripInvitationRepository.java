package com.wanderplan.invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripInvitationRepository extends JpaRepository<TripInvitation, Long> {

    Optional<TripInvitation> findByToken(String token);

    List<TripInvitation> findByTripIdOrderByCreatedAtDesc(Long tripId);

    Optional<TripInvitation> findByTripIdAndInvitedEmailAndStatus(Long tripId, String invitedEmail, InvitationStatus status);

    boolean existsByTripIdAndInvitedEmailAndStatus(Long tripId, String invitedEmail, InvitationStatus status);

    List<TripInvitation> findByInvitedEmailAndStatus(String invitedEmail, InvitationStatus status);
}
