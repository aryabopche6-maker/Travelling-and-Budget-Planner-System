package com.wanderplan.itinerary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByTripIdOrderByDayNumberAsc(Long tripId);

    @Query("select distinct d from ItineraryDay d left join fetch d.activities where d.trip.id = :tripId order by d.dayNumber asc")
    List<ItineraryDay> findWithActivitiesByTripId(@Param("tripId") Long tripId);

    void deleteByTripId(Long tripId);
}
