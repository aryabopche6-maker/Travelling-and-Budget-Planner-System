package com.wanderplan.trip;

import com.wanderplan.exception.ForbiddenException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.member.MemberResponse;
import com.wanderplan.member.TripMember;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.preference.Preference;
import com.wanderplan.preference.PreferenceRepository;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreferenceRepository preferenceRepository;

    @Transactional
    public TripResponse createTrip(Long userId, CreateTripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Trip trip = Trip.builder()
                .destination(request.getDestination())
                .startingLocation(request.getStartingLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numberOfTravelers(request.getNumberOfTravelers() != null ? request.getNumberOfTravelers() : 1)
                .budget(request.getBudget())
                .travelMode(request.getTravelMode() != null ? request.getTravelMode() : "flight")
                .travelPace(request.getTravelPace() != null ? request.getTravelPace() : "Balanced")
                .travelStyle(request.getTravelStyle() != null ? request.getTravelStyle() : "Moderate")
                .status("planning")
                .createdBy(userId)
                .build();

        trip = tripRepository.save(trip);

        // Creator automatically becomes trip admin
        TripMember creatorMember = TripMember.builder()
                .trip(trip)
                .user(user)
                .isTripAdmin(true)
                .status("ACCEPTED")
                .build();

        tripMemberRepository.save(creatorMember);

        // Save interests if provided
        if (request.getInterests() != null && !request.getInterests().isEmpty()) {
            for (String interest : request.getInterests()) {
                Preference pref = Preference.builder()
                        .trip(trip)
                        .name(interest)
                        .build();
                preferenceRepository.save(pref);
            }
        }

        return mapToTripResponse(trip);
    }

    public List<TripResponse> getMyTrips(Long userId) {
        List<Trip> trips = tripRepository.findTripsByUserId(userId);
        return trips.stream().map(this::mapToTripResponse).collect(Collectors.toList());
    }

    public TripResponse getTripById(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        validateTripMembership(tripId, userId);

        return mapToTripResponse(trip);
    }

    @Transactional
    public TripResponse updateTrip(Long tripId, Long userId, UpdateTripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateTripAdmin(tripId, userId);

        if (request.getDestination() != null) trip.setDestination(request.getDestination());
        if (request.getStartingLocation() != null) trip.setStartingLocation(request.getStartingLocation());
        if (request.getStartDate() != null) trip.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) trip.setEndDate(request.getEndDate());
        if (request.getNumberOfTravelers() != null) trip.setNumberOfTravelers(request.getNumberOfTravelers());
        if (request.getBudget() != null) trip.setBudget(request.getBudget());
        if (request.getTravelMode() != null) trip.setTravelMode(request.getTravelMode());
        if (request.getTravelPace() != null) trip.setTravelPace(request.getTravelPace());
        if (request.getTravelStyle() != null) trip.setTravelStyle(request.getTravelStyle());
        if (request.getStatus() != null) trip.setStatus(request.getStatus());

        if (request.getInterests() != null) {
            preferenceRepository.deleteByTripId(tripId);
            for (String interest : request.getInterests()) {
                preferenceRepository.save(Preference.builder().trip(trip).name(interest).build());
            }
        }

        trip = tripRepository.save(trip);
        return mapToTripResponse(trip);
    }

    @Transactional
    public void deleteTrip(Long tripId, Long userId) {
        validateTripAdmin(tripId, userId);
        tripRepository.deleteById(tripId);
    }

    public void validateTripMembership(Long tripId, Long userId) {
        boolean isMember = tripMemberRepository.existsByTripIdAndUserId(tripId, userId);
        if (!isMember) {
            throw new ForbiddenException("Access denied: You are not a member of this trip.");
        }
    }

    public void validateTripAdmin(Long tripId, Long userId) {
        TripMember member = tripMemberRepository.findByTripIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ForbiddenException("Access denied: You are not a member of this trip."));
        if (!Boolean.TRUE.equals(member.getIsTripAdmin())) {
            throw new ForbiddenException("Access denied: Only trip admins can perform this action.");
        }
    }

    public TripResponse mapToTripResponse(Trip trip) {
        List<TripMember> members = tripMemberRepository.findByTripId(trip.getId());
        List<MemberResponse> memberResponses = members.stream().map(m -> MemberResponse.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .name(m.getUser().getName())
                .email(m.getUser().getEmail())
                .isTripAdmin(m.getIsTripAdmin())
                .role(m.getIsTripAdmin() ? "TRIP_ADMIN" : "TRAVELER")
                .status(m.getStatus())
                .joinedAt(m.getJoinedAt())
                .build()
        ).collect(Collectors.toList());

        List<Preference> preferences = preferenceRepository.findByTripId(trip.getId());
        List<String> interests = preferences.stream().map(Preference::getName).collect(Collectors.toList());

        return TripResponse.builder()
                .id(trip.getId())
                .destination(trip.getDestination())
                .startingLocation(trip.getStartingLocation())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .numberOfTravelers(trip.getNumberOfTravelers())
                .budget(trip.getBudget())
                .spent(0.0) // Calculated dynamically in budget service
                .travelMode(trip.getTravelMode())
                .travelPace(trip.getTravelPace())
                .travelStyle(trip.getTravelStyle())
                .status(trip.getStatus())
                .createdBy(trip.getCreatedBy())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .members(memberResponses)
                .interests(interests)
                .build();
    }
}
