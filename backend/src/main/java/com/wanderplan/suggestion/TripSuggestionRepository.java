package com.wanderplan.suggestion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripSuggestionRepository extends JpaRepository<TripSuggestion, Long> {
    List<TripSuggestion> findByTripIdOrderByCreatedAtDesc(Long tripId);
    List<TripSuggestion> findByTripIdAndStatusOrderByCreatedAtDesc(Long tripId, String status);
    long countByTripIdAndStatus(Long tripId, String status);
}
