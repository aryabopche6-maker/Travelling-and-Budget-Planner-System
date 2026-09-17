package com.wanderplan.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    @Query("SELECT tm.trip FROM TripMember tm WHERE tm.user.id = :userId AND tm.status = 'ACCEPTED'")
    List<Trip> findTripsByUserId(@Param("userId") Long userId);
}
