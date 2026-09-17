package com.wanderplan.poll;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PollService {

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    @Transactional
    public PollResponse createPoll(Long tripId, Long userId, CreatePollRequest request) {
        tripService.validateTripAdmin(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        Poll poll = Poll.builder()
                .trip(trip)
                .title(request.getTitle())
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .createdBy(userId)
                .options(new ArrayList<>())
                .build();

        poll = pollRepository.save(poll);

        for (String optText : request.getOptions()) {
            PollOption option = PollOption.builder()
                    .poll(poll)
                    .optionText(optText)
                    .build();
            poll.getOptions().add(option);
        }

        poll = pollRepository.save(poll);

        return mapToResponse(poll, userId);
    }

    public List<PollResponse> getTripPolls(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        List<Poll> polls = pollRepository.findByTripId(tripId);
        return polls.stream().map(p -> mapToResponse(p, userId)).collect(Collectors.toList());
    }

    @Transactional
    public PollResponse castVote(Long tripId, Long pollId, Long userId, VoteRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        if (voteRepository.existsByPollIdAndUserId(pollId, userId)) {
            throw new BadRequestException("You have already voted in this poll!");
        }

        PollOption option = poll.getOptions().stream()
                .filter(o -> o.getId().equals(request.getOptionId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Option not found in this poll"));

        Vote vote = Vote.builder()
                .poll(poll)
                .option(option)
                .userId(userId)
                .build();

        voteRepository.save(vote);

        return mapToResponse(poll, userId);
    }

    private PollResponse mapToResponse(Poll poll, Long userId) {
        List<Vote> votes = voteRepository.findByPollId(poll.getId());
        long totalVotes = votes.size();

        Optional<Vote> userVote = voteRepository.findByPollIdAndUserId(poll.getId(), userId);
        boolean hasVoted = userVote.isPresent();
        Long userOptionId = userVote.map(v -> v.getOption().getId()).orElse(null);

        List<PollOptionDto> optionDtos = poll.getOptions().stream().map(opt -> {
            long count = votes.stream().filter(v -> v.getOption().getId().equals(opt.getId())).count();
            double pct = totalVotes > 0 ? (count * 100.0) / totalVotes : 0.0;

            return PollOptionDto.builder()
                    .id(opt.getId())
                    .text(opt.getOptionText())
                    .votesCount(count)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        return PollResponse.builder()
                .id(poll.getId())
                .title(poll.getTitle())
                .category(poll.getCategory())
                .isAnonymous(poll.getIsAnonymous())
                .createdBy(poll.getCreatedBy())
                .totalVotes(totalVotes)
                .hasVoted(hasVoted)
                .userVotedOptionId(userOptionId)
                .options(optionDtos)
                .createdAt(poll.getCreatedAt())
                .build();
    }
}
