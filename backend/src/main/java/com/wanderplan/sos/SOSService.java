package com.wanderplan.sos;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.notification.NotificationService;
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

        alert = sosAlertRepository.save(alert);

        // Notify trusted members
        notificationService.createNotification(userId, "SOS Alert", "EMERGENCY: " + user.getName() + " triggered an SOS alert (" + request.getEmergencyType() + ")", "SOS");

        return mapToResponse(alert);
    }

    @Transactional
    public SOSResponse updateLocation(Long tripId, Long sosId, Long userId, LocationUpdateRequest request) {
        tripService.validateTripMembership(tripId, userId);

        SOSAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found"));

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

        alert.setStatus("SAFE");
        alert = sosAlertRepository.save(alert);

        notificationService.createNotification(userId, "SOS Resolved", alert.getUser().getName() + " has marked themselves SAFE.", "SOS");

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
                .build();
    }
}
