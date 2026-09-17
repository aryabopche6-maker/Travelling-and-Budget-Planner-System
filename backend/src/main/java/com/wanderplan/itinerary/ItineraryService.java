package com.wanderplan.itinerary;

import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryDayRepository dayRepository;

    @Autowired
    private ItineraryActivityRepository activityRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    public ItineraryResponse getItinerary(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        List<ItineraryDay> days = dayRepository.findByTripIdOrderByDayNumberAsc(tripId);
        if (days.isEmpty()) {
            // Auto-generate initial days if empty
            days = generateInitialItinerary(tripId);
        }

        List<ItineraryDayDto> dayDtos = days.stream().map(d -> {
            List<ItineraryActivityDto> actDtos = d.getActivities().stream().map(a -> ItineraryActivityDto.builder()
                    .id(a.getId())
                    .time(a.getTime())
                    .title(a.getTitle())
                    .category(a.getCategory())
                    .location(a.getLocation())
                    .estimatedCost(a.getEstimatedCost())
                    .duration(a.getDuration())
                    .isOutdoor(a.getIsOutdoor())
                    .orderIndex(a.getOrderIndex())
                    .build()
            ).collect(Collectors.toList());

            return ItineraryDayDto.builder()
                    .id(d.getId())
                    .dayNumber(d.getDayNumber())
                    .title(d.getTitle())
                    .date(d.getDate())
                    .activities(actDtos)
                    .build();
        }).collect(Collectors.toList());

        return ItineraryResponse.builder()
                .tripId(tripId)
                .days(dayDtos)
                .build();
    }

    @Transactional
    public List<ItineraryDay> generateInitialItinerary(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        dayRepository.deleteByTripId(tripId);

        long numDays = 3;
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            numDays = Math.max(1, ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1);
        }

        List<ItineraryDay> generatedDays = new ArrayList<>();
        LocalDate startDate = trip.getStartDate() != null ? trip.getStartDate() : LocalDate.now();

        for (int i = 1; i <= numDays; i++) {
            ItineraryDay day = ItineraryDay.builder()
                    .trip(trip)
                    .dayNumber(i)
                    .title("Day " + i + ": Exploring " + trip.getDestination())
                    .date(startDate.plusDays(i - 1))
                    .activities(new ArrayList<>())
                    .build();

            day = dayRepository.save(day);

            // Default activities per day
            ItineraryActivity morning = ItineraryActivity.builder()
                    .itineraryDay(day)
                    .time("09:00 AM")
                    .title("Breakfast & Morning Exploration")
                    .category("Food & Culture")
                    .location(trip.getDestination() + " City Center")
                    .estimatedCost(500.0)
                    .duration("2 hrs")
                    .isOutdoor(true)
                    .orderIndex(1)
                    .build();

            ItineraryActivity lunch = ItineraryActivity.builder()
                    .itineraryDay(day)
                    .time("01:00 PM")
                    .title("Local Cuisine Lunch")
                    .category("Food & Culture")
                    .location(trip.getDestination() + " Popular Eatery")
                    .estimatedCost(800.0)
                    .duration("1.5 hrs")
                    .isOutdoor(false)
                    .orderIndex(2)
                    .build();

            ItineraryActivity afternoon = ItineraryActivity.builder()
                    .itineraryDay(day)
                    .time("03:30 PM")
                    .title("Sightseeing Highlight")
                    .category("Attraction")
                    .location(trip.getDestination() + " Landmark")
                    .estimatedCost(1200.0)
                    .duration("3 hrs")
                    .isOutdoor(true)
                    .orderIndex(3)
                    .build();

            activityRepository.save(morning);
            activityRepository.save(lunch);
            activityRepository.save(afternoon);

            day.getActivities().add(morning);
            day.getActivities().add(lunch);
            day.getActivities().add(afternoon);

            generatedDays.add(day);
        }

        return generatedDays;
    }

    @Transactional
    public ItineraryActivityDto addActivity(Long tripId, Long userId, ActivityRequest request) {
        tripService.validateTripMembership(tripId, userId);

        ItineraryDay day = dayRepository.findById(request.getDayId())
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found"));

        ItineraryActivity act = ItineraryActivity.builder()
                .itineraryDay(day)
                .time(request.getTime() != null ? request.getTime() : "10:00 AM")
                .title(request.getTitle())
                .category(request.getCategory() != null ? request.getCategory() : "Activity")
                .location(request.getLocation() != null ? request.getLocation() : "Local Attraction")
                .estimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : 0.0)
                .duration(request.getDuration() != null ? request.getDuration() : "1 hr")
                .isOutdoor(request.getIsOutdoor() != null ? request.getIsOutdoor() : true)
                .orderIndex(day.getActivities().size() + 1)
                .build();

        act = activityRepository.save(act);

        return ItineraryActivityDto.builder()
                .id(act.getId())
                .time(act.getTime())
                .title(act.getTitle())
                .category(act.getCategory())
                .location(act.getLocation())
                .estimatedCost(act.getEstimatedCost())
                .duration(act.getDuration())
                .isOutdoor(act.getIsOutdoor())
                .orderIndex(act.getOrderIndex())
                .build();
    }

    @Transactional
    public void deleteActivity(Long tripId, Long activityId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        activityRepository.deleteById(activityId);
    }
}
