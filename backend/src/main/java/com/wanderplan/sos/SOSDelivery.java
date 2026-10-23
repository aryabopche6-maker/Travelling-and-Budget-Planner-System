package com.wanderplan.sos;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_deliveries")
public class SOSDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_alert_id", nullable = false)
    private SOSAlert sosAlert;

    @Column(nullable = false, length = 80)
    private String contactName;

    @Column(nullable = false, length = 16)
    private String phone;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, length = 200)
    private String message;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public SOSDelivery() {}

    public SOSDelivery(SOSAlert sosAlert, SOSDeliveryResult result) {
        this.sosAlert = sosAlert;
        this.contactName = result.getName();
        this.phone = result.getPhone();
        this.status = result.getStatus();
        this.message = result.getMessage();
    }

    public SOSDeliveryResult toResult() {
        return new SOSDeliveryResult(contactName, phone, status, message);
    }
}
