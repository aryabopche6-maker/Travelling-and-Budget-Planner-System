package com.wanderplan.activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityFeedRepository extends JpaRepository<ActivityFeed, Long> {
    List<ActivityFeed> findByTripIdOrderByCreatedAtDesc(Long tripId);
    List<ActivityFeed> findTop50ByTripIdOrderByCreatedAtDesc(Long tripId);
}
