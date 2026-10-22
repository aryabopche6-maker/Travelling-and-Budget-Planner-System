package com.wanderplan.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripSelectedHotelRepository extends JpaRepository<TripSelectedHotel, Long> {
    List<TripSelectedHotel> findByTripIdOrderByIdAsc(Long tripId);
    Optional<TripSelectedHotel> findFirstByTripIdOrderByIdDesc(Long tripId);
    void deleteByTripId(Long tripId);
    void deleteByTripIdAndNameIgnoreCase(Long tripId, String name);
}
