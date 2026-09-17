package com.wanderplan.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    List<TripMember> findByTripId(Long tripId);
    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);
    Boolean existsByTripIdAndUserId(Long tripId, Long userId);
}
