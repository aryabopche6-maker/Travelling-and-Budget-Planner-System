package com.wanderplan.sos;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SOSContactRepository extends JpaRepository<SOSContact, Long> {
    List<SOSContact> findByTripIdAndUserIdOrderByCreatedAtAsc(Long tripId, Long userId);
    Optional<SOSContact> findByIdAndTripIdAndUserId(Long id, Long tripId, Long userId);
    long countByTripIdAndUserId(Long tripId, Long userId);
    boolean existsByTripIdAndUserIdAndPhone(Long tripId, Long userId, String phone);
    boolean existsByTripIdAndUserIdAndPhoneAndIdNot(Long tripId, Long userId, String phone, Long id);
}
