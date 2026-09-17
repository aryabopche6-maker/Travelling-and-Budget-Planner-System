package com.wanderplan.member;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
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
public class MemberService {

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripService tripService;

    public List<MemberResponse> getTripMembers(Long tripId, Long currentUserId) {
        tripService.validateTripMembership(tripId, currentUserId);
        return tripMemberRepository.findByTripId(tripId).stream()
                .map(m -> MemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .isTripAdmin(m.getIsTripAdmin())
                        .role(m.getIsTripAdmin() ? "TRIP_ADMIN" : "TRAVELER")
                        .status(m.getStatus())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse inviteMember(Long tripId, Long currentUserId, InviteMemberRequest request) {
        tripService.validateTripAdmin(tripId, currentUserId);

        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + request.getEmail() + " not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (tripMemberRepository.existsByTripIdAndUserId(tripId, invitee.getId())) {
            throw new BadRequestException("User is already a member or has been invited to this trip");
        }

        TripMember member = TripMember.builder()
                .trip(trip)
                .user(invitee)
                .isTripAdmin(false)
                .status("ACCEPTED") // Auto-joined for seamless college app UX
                .build();

        member = tripMemberRepository.save(member);

        return MemberResponse.builder()
                .id(member.getId())
                .userId(invitee.getId())
                .name(invitee.getName())
                .email(invitee.getEmail())
                .isTripAdmin(false)
                .role("TRAVELER")
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    @Transactional
    public void removeMember(Long tripId, Long memberId, Long currentUserId) {
        tripService.validateTripAdmin(tripId, currentUserId);

        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (Boolean.TRUE.equals(member.getIsTripAdmin())) {
            throw new BadRequestException("Cannot remove trip admin");
        }

        tripMemberRepository.delete(member);
    }
}
