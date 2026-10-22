package com.wanderplan.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripSelectedPlaceRepository extends JpaRepository<TripSelectedPlace, Long> {
    List<TripSelectedPlace> findByTripIdOrderByIdAsc(Long tripId);
    Optional<TripSelectedPlace> findByTripIdAndNameIgnoreCase(Long tripId, String name);
    void deleteByTripId(Long tripId);
    void deleteByTripIdAndNameIgnoreCase(Long tripId, String name);
}
