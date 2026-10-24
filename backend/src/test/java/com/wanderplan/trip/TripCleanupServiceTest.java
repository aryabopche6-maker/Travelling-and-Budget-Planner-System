package com.wanderplan.trip;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.junit.jupiter.api.Assertions.assertFalse;

@DataJpaTest
@Import(TripCleanupService.class)
class TripCleanupServiceTest {

    @Autowired private TestEntityManager entityManager;
    @Autowired private TripCleanupService tripCleanupService;
    @Autowired private TripRepository tripRepository;

    @Test
    void deletesTripAndItsDependentData() {
        Trip trip = entityManager.persist(Trip.builder().destination("Oslo").build());
        entityManager.flush();

        tripCleanupService.deleteTripData(trip.getId());
        entityManager.clear();

        assertFalse(tripRepository.findById(trip.getId()).isPresent());
    }
}
