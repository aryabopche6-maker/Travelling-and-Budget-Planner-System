package com.wanderplan.sos;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SOSDeliveryService {

    public List<SOSDeliveryResult> prepareManualAlerts(List<SOSContactRequest> contacts) {
        return contacts.stream()
                .map(contact -> new SOSDeliveryResult(
                        contact.getName(),
                        contact.getPhone(),
                        "MANUAL",
                        "Waiting for the user to send the SMS from their device."))
                .toList();
    }
}
