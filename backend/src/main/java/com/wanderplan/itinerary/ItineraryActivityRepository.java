package com.wanderplan.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItineraryActivityRepository extends JpaRepository<ItineraryActivity, Long> {
}
