package com.wanderplan.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HiddenCostRepository extends JpaRepository<HiddenCost, Long> {
    List<HiddenCost> findByTripId(Long tripId);
}
