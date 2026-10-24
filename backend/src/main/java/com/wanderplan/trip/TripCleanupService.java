package com.wanderplan.trip;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TripCleanupService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void deleteTripData(Long tripId) {
        delete("DELETE FROM Vote v WHERE v.poll.id IN (SELECT p.id FROM Poll p WHERE p.trip.id = :tripId)", tripId);
        delete("DELETE FROM PollOption o WHERE o.poll.id IN (SELECT p.id FROM Poll p WHERE p.trip.id = :tripId)", tripId);
        delete("DELETE FROM Poll p WHERE p.trip.id = :tripId", tripId);
        delete("DELETE FROM ItineraryActivity a WHERE a.itineraryDay.id IN (SELECT d.id FROM ItineraryDay d WHERE d.trip.id = :tripId)", tripId);
        delete("DELETE FROM ItineraryDay d WHERE d.trip.id = :tripId", tripId);
        delete("DELETE FROM SOSDelivery d WHERE d.sosAlert.id IN (SELECT a.id FROM SOSAlert a WHERE a.trip.id = :tripId)", tripId);
        delete("DELETE FROM SOSAlert a WHERE a.trip.id = :tripId", tripId);
        delete("DELETE FROM ExpenseSplit s WHERE s.expense.id IN (SELECT e.id FROM Expense e WHERE e.trip.id = :tripId)", tripId);
        delete("DELETE FROM Expense e WHERE e.trip.id = :tripId", tripId);
        delete("DELETE FROM TripInvitation i WHERE i.trip.id = :tripId", tripId);
        delete("DELETE FROM TripSelectedHotel h WHERE h.trip.id = :tripId", tripId);
        delete("DELETE FROM TripSelectedPlace p WHERE p.trip.id = :tripId", tripId);
        delete("DELETE FROM TripSuggestion s WHERE s.trip.id = :tripId", tripId);
        delete("DELETE FROM ActivityFeed a WHERE a.trip.id = :tripId", tripId);
        delete("DELETE FROM HiddenCost h WHERE h.trip.id = :tripId", tripId);
        delete("DELETE FROM SOSContact c WHERE c.trip.id = :tripId", tripId);
        delete("DELETE FROM Preference p WHERE p.trip.id = :tripId", tripId);
        delete("DELETE FROM TripMember m WHERE m.trip.id = :tripId", tripId);
        delete("DELETE FROM Trip t WHERE t.id = :tripId", tripId);
    }

    private void delete(String query, Long tripId) {
        entityManager.createQuery(query)
                .setParameter("tripId", tripId)
                .executeUpdate();
    }
}
