package com.wanderplan.sos;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ForbiddenException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.notification.NotificationService;
import com.wanderplan.member.TripMember;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SOSService {

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private SOSDeliveryService sosDeliveryService;

    @Autowired
    private SOSContactRepository sosContactRepository;

    @Autowired
    private SOSDeliveryRepository sosDeliveryRepository;

    @Transactional(readOnly = true)
    public List<SOSContactResponse> getContacts(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return sosContactRepository.findByTripIdAndUserIdOrderByCreatedAtAsc(tripId, userId).stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SOSContactResponse addContact(Long tripId, Long userId, SOSContactRequest request) {
        tripService.validateTripMembership(tripId, userId);
        if (sosContactRepository.countByTripIdAndUserId(tripId, userId) >= 5) {
            throw new BadRequestException("You can add up to five emergency contacts.");
        }
        if (sosContactRepository.existsByTripIdAndUserIdAndPhone(tripId, userId, request.getPhone())) {
            throw new BadRequestException("That phone number is already in your emergency contacts.");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        SOSContact contact = sosContactRepository.save(new SOSContact(
                trip, user, request.getName().trim(), request.getPhone(), normalizeRelationship(request.getRelationship())));
        return mapToContactResponse(contact);
    }

    @Transactional
    public SOSContactResponse updateContact(Long tripId, Long contactId, Long userId, SOSContactRequest request) {
        tripService.validateTripMembership(tripId, userId);
        SOSContact contact = sosContactRepository.findByIdAndTripIdAndUserId(contactId, tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found"));
        if (sosContactRepository.existsByTripIdAndUserIdAndPhoneAndIdNot(
                tripId, userId, request.getPhone(), contactId)) {
            throw new BadRequestException("That phone number is already in your emergency contacts.");
        }

        contact.setName(request.getName().trim());
        contact.setPhone(request.getPhone());
        contact.setRelationship(normalizeRelationship(request.getRelationship()));
        return mapToContactResponse(sosContactRepository.save(contact));
    }

    @Transactional
    public void deleteContact(Long tripId, Long contactId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        SOSContact contact = sosContactRepository.findByIdAndTripIdAndUserId(contactId, tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found"));
        sosContactRepository.delete(contact);
    }

    @Transactional
    public SOSResponse triggerSOS(Long tripId, Long userId, SOSRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SOSAlert alert = SOSAlert.builder()
                .trip(trip)
                .user(user)
                .emergencyType(request.getEmergencyType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status("ACTIVE")
                .build();

        SOSAlert savedAlert = sosAlertRepository.save(alert);

        String mapUrl = request.getLatitude() != null && request.getLongitude() != null
                ? " https://maps.google.com/?q=" + request.getLatitude() + "," + request.getLongitude()
                : " The phone location was unavailable.";
        List<SOSContactRequest> contacts = sosContactRepository
                .findByTripIdAndUserIdOrderByCreatedAtAsc(tripId, userId).stream()
                .map(contact -> new SOSContactRequest(contact.getName(), contact.getPhone()))
                .collect(Collectors.toList());
        List<SOSDeliveryResult> deliveryResults = sosDeliveryService.prepareManualAlerts(contacts);
        sosDeliveryRepository.saveAll(deliveryResults.stream()
                .map(result -> new SOSDelivery(savedAlert, result))
                .collect(Collectors.toList()));

        String notificationMessage = "EMERGENCY: " + user.getName() + " triggered an SOS alert ("
                + request.getEmergencyType() + ")." + mapUrl;
        for (TripMember member : tripMemberRepository.findByTripId(tripId)) {
            if (member.getUser().getId().equals(userId) || !"ACCEPTED".equalsIgnoreCase(member.getStatus())) {
                continue;
            }
            notificationService.createNotification(member.getUser().getId(), "SOS Alert", notificationMessage, "SOS");
        }

        SOSResponse response = mapToResponse(savedAlert);
        response.setSmsDeliveryResults(deliveryResults);
        return response;
    }

    @Transactional
    public SOSResponse updateLocation(Long tripId, Long sosId, Long userId, LocationUpdateRequest request) {
        tripService.validateTripMembership(tripId, userId);

        SOSAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found"));
        validateAlertOwner(alert, tripId, userId);

        if (!"ACTIVE".equalsIgnoreCase(alert.getStatus())) {
            throw new BadRequestException("Location sharing is disabled because SOS is no longer active.");
        }

        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());

        return mapToResponse(sosAlertRepository.save(alert));
    }

    @Transactional
    public SOSResponse markSafe(Long tripId, Long sosId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        SOSAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found"));
        validateAlertOwner(alert, tripId, userId);

        alert.setStatus("SAFE");
        alert = sosAlertRepository.save(alert);

        for (TripMember member : tripMemberRepository.findByTripId(tripId)) {
            if (member.getUser().getId().equals(userId) || !"ACCEPTED".equalsIgnoreCase(member.getStatus())) {
                continue;
            }
            notificationService.createNotification(member.getUser().getId(), "SOS Resolved",
                    alert.getUser().getName() + " has marked themselves SAFE.", "SOS");
        }

        return mapToResponse(alert);
    }

    public List<SOSResponse> getTripSOSAlerts(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return sosAlertRepository.findByTripIdOrderByCreatedTimeDesc(tripId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SOSResponse mapToResponse(SOSAlert alert) {
        return SOSResponse.builder()
                .id(alert.getId())
                .tripId(alert.getTrip().getId())
                .userId(alert.getUser().getId())
                .userName(alert.getUser().getName())
                .userPhone(alert.getUser().getPhone())
                .emergencyType(alert.getEmergencyType())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .status(alert.getStatus())
                .createdTime(alert.getCreatedTime())
                .updatedTime(alert.getUpdatedTime())
                .smsDeliveryResults(sosDeliveryRepository.findBySosAlertIdOrderByIdAsc(alert.getId()).stream()
                        .map(SOSDelivery::toResult)
                        .collect(Collectors.toList()))
                .build();
    }

    private SOSContactResponse mapToContactResponse(SOSContact contact) {
        return new SOSContactResponse(
                contact.getId(), contact.getName(), contact.getPhone(), contact.getRelationship());
    }

    private String normalizeRelationship(String relationship) {
        return relationship == null || relationship.isBlank() ? null : relationship.trim();
    }

    private void validateAlertOwner(SOSAlert alert, Long tripId, Long userId) {
        if (!alert.getTrip().getId().equals(tripId) || !alert.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own SOS alert.");
        }
    }
}
