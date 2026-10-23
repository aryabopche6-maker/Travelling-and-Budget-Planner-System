package com.wanderplan.sos;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SOSDeliveryRepository extends JpaRepository<SOSDelivery, Long> {
    List<SOSDelivery> findBySosAlertIdOrderByIdAsc(Long sosAlertId);
}
