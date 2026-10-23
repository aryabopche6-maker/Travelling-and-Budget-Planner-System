package com.wanderplan.itinerary;

import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.hotel.HotelResponse;
import com.wanderplan.hotel.HotelService;
import com.wanderplan.place.PlaceResponse;
import com.wanderplan.place.PlaceService;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    @Autowired
    private ItineraryDayRepository dayRepository;

    @Autowired
    private ItineraryActivityRepository activityRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private TripSelectedPlaceRepository selectedPlaceRepository;

    @Autowired
    private TripSelectedHotelRepository selectedHotelRepository;

    @Autowired
    private PlaceService placeService;

    @Autowired
    private HotelService hotelService;

    @Transactional
    public ItineraryResponse getItinerary(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        long expectedDays = calculateTripDays(trip);

        List<ItineraryDay> days = dayRepository.findByTripIdOrderByDayNumberAsc(tripId);
        // If itinerary is empty OR number of days doesn't match trip duration, auto-generate!
        if (days.isEmpty() || days.size() != expectedDays) {
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
                    .imageUrl(a.getImageUrl())
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

    private long calculateTripDays(Trip trip) {
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
            return Math.max(1, days);
        }
        return 3;
    }

    @Transactional
    public List<ItineraryDay> generateInitialItinerary(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        dayRepository.deleteByTripId(tripId);

        long numDays = calculateTripDays(trip);
        LocalDate startDate = trip.getStartDate() != null ? trip.getStartDate() : LocalDate.now();

        // 1. Fetch user selected places & hotels
        List<TripSelectedPlace> selectedPlaces = selectedPlaceRepository.findByTripIdOrderByIdAsc(tripId);
        Optional<TripSelectedHotel> selectedHotelOpt = selectedHotelRepository.findFirstByTripIdOrderByIdDesc(tripId);

        // 2. Fallbacks if user hasn't selected places/hotel yet: use live places & hotels for destination
        List<PlaceResponse> candidatePlaces = new ArrayList<>();
        if (selectedPlaces.isEmpty()) {
            try {
                candidatePlaces = placeService.getPlacesForTrip(tripId, trip.getCreatedBy() != null ? trip.getCreatedBy() : 1L, null, 25);
            } catch (Exception e) {
                log.warn("Could not fetch candidate places: {}", e.getMessage());
            }
        }

        HotelResponse candidateHotel = null;
        if (selectedHotelOpt.isEmpty()) {
            try {
                List<HotelResponse> hotels = hotelService.getHotelsForTrip(tripId, trip.getCreatedBy() != null ? trip.getCreatedBy() : 1L, null, 25);
                if (hotels != null && !hotels.isEmpty()) {
                    candidateHotel = hotels.get(0);
                }
            } catch (Exception e) {
                log.warn("Could not fetch candidate hotel: {}", e.getMessage());
            }
        }

        String hotelName = selectedHotelOpt.map(TripSelectedHotel::getName)
                .orElse(candidateHotel != null ? candidateHotel.getName() : null);
        String hotelLocation = selectedHotelOpt.map(TripSelectedHotel::getLocation)
                .orElse(candidateHotel != null ? candidateHotel.getLocation() : trip.getDestination());
        String hotelImage = selectedHotelOpt.map(TripSelectedHotel::getImageUrl)
                .orElse(candidateHotel != null ? candidateHotel.getImageUrl() : null);
        Double hotelPrice = selectedHotelOpt.isPresent()
                ? selectedHotelOpt.get().getPricePerNight()
                : candidateHotel != null ? candidateHotel.getPricePerNight() : null;

        // Divide selected places across days (approx 2 places per day)
        // If not enough selected places, fill remaining with candidates or destination highlights
        List<TripSelectedPlace> placesPool = new ArrayList<>(selectedPlaces);
        int placeIndex = 0;
        int candidateIndex = 0;

        List<ItineraryDay> generatedDays = new ArrayList<>();

        for (int dayNum = 1; dayNum <= numDays; dayNum++) {
            LocalDate dayDate = startDate.plusDays(dayNum - 1);
            ItineraryDay day = ItineraryDay.builder()
                    .trip(trip)
                    .dayNumber(dayNum)
                    .title("Day " + dayNum + ": " + (dayNum == 1 ? "Arrival & " : "") + "Exploring " + trip.getDestination())
                    .date(dayDate)
                    .activities(new ArrayList<>())
                    .build();

            day = dayRepository.save(day);

            List<ItineraryActivity> acts = new ArrayList<>();
            int order = 1;

            // Day 1: Check-in activity
            if (dayNum == 1 && hotelName != null) {
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("11:00 AM")
                        .title("Check-in: " + hotelName)
                        .category("Stay & Hotel")
                        .location(hotelLocation)
                        .estimatedCost(hotelPrice)
                        .duration("1 hr")
                        .isOutdoor(false)
                        .orderIndex(order++)
                        .imageUrl(hotelImage)
                        .build());
            } else if (dayNum > 1 && hotelName != null) {
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("08:30 AM")
                        .title("Breakfast at " + hotelName)
                        .category("Food & Culture")
                        .location(hotelLocation)
                        .estimatedCost(450.0)
                        .duration("1 hr")
                        .isOutdoor(false)
                        .orderIndex(order++)
                        .imageUrl(hotelImage)
                        .build());
            }

            // Morning / Midday Activity from user selected places
            if (placeIndex < placesPool.size()) {
                TripSelectedPlace sp = placesPool.get(placeIndex++);
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("10:30 AM")
                        .title(sp.getName())
                        .category(sp.getCategory() != null ? sp.getCategory() : "Attraction")
                        .location(sp.getLocation() != null ? sp.getLocation() : trip.getDestination())
                        .estimatedCost(sp.getEstimatedCost())
                        .duration(sp.getDuration() != null ? sp.getDuration() : "2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .imageUrl(sp.getImageUrl())
                        .build());
            } else if (candidateIndex < candidatePlaces.size()) {
                PlaceResponse cp = candidatePlaces.get(candidateIndex++);
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("10:30 AM")
                        .title(cp.getName())
                        .category(cp.getCategory() != null ? cp.getCategory() : "Attraction")
                        .location(cp.getLocation() != null ? cp.getLocation() : trip.getDestination())
                        .estimatedCost(cp.getEstimatedCost())
                        .duration(cp.getDuration() != null ? cp.getDuration() : "2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .imageUrl(cp.getImageUrl())
                        .build());
            } else {
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("10:30 AM")
                        .title("Morning Discovery: " + trip.getDestination() + " Heritage")
                        .category("Attraction")
                        .location(trip.getDestination())
                        .estimatedCost(200.0)
                        .duration("2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .build());
            }

            // Lunch
            acts.add(ItineraryActivity.builder()
                    .itineraryDay(day)
                    .time("01:30 PM")
                    .title("Authentic Local Lunch & Refreshment")
                    .category("Food & Culture")
                    .location(trip.getDestination() + " Coastal Eatery")
                    .estimatedCost(700.0)
                    .duration("1.5 hrs")
                    .isOutdoor(false)
                    .orderIndex(order++)
                    .build());

            // Afternoon / Evening place from user selected places
            if (placeIndex < placesPool.size()) {
                TripSelectedPlace sp = placesPool.get(placeIndex++);
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("04:00 PM")
                        .title(sp.getName())
                        .category(sp.getCategory() != null ? sp.getCategory() : "Attraction")
                        .location(sp.getLocation() != null ? sp.getLocation() : trip.getDestination())
                        .estimatedCost(sp.getEstimatedCost() != null ? sp.getEstimatedCost() : 0.0)
                        .duration(sp.getDuration() != null ? sp.getDuration() : "2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .imageUrl(sp.getImageUrl())
                        .build());
            } else if (candidateIndex < candidatePlaces.size()) {
                PlaceResponse cp = candidatePlaces.get(candidateIndex++);
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("04:00 PM")
                        .title(cp.getName())
                        .category(cp.getCategory() != null ? cp.getCategory() : "Attraction")
                        .location(cp.getLocation() != null ? cp.getLocation() : trip.getDestination())
                        .estimatedCost(cp.getEstimatedCost() != null ? cp.getEstimatedCost() : 0.0)
                        .duration(cp.getDuration() != null ? cp.getDuration() : "2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .imageUrl(cp.getImageUrl())
                        .build());
            } else {
                acts.add(ItineraryActivity.builder()
                        .itineraryDay(day)
                        .time("04:30 PM")
                        .title("Sunset Stroll & Sightseeing")
                        .category("Sightseeing & Culture")
                        .location(trip.getDestination())
                        .estimatedCost(0.0)
                        .duration("2 hrs")
                        .isOutdoor(true)
                        .orderIndex(order++)
                        .build());
            }

            // Evening Relax / Dinner
            acts.add(ItineraryActivity.builder()
                    .itineraryDay(day)
                    .time("08:00 PM")
                    .title("Dinner & Leisure at " + hotelName)
                    .category("Food & Culture")
                    .location(hotelLocation)
                    .estimatedCost(1000.0)
                    .duration("2 hrs")
                    .isOutdoor(false)
                    .orderIndex(order++)
                    .imageUrl(hotelImage)
                    .build());

            for (ItineraryActivity a : acts) {
                activityRepository.save(a);
            }
            day.setActivities(acts);
            generatedDays.add(day);
        }

        return generatedDays;
    }

    // --- Place Selection API ---
    public List<TripSelectedPlace> getSelectedPlaces(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return selectedPlaceRepository.findByTripIdOrderByIdAsc(tripId);
    }

    @Transactional
    public TripSelectedPlace addSelectedPlace(Long tripId, Long userId, TripSelectedPlace place) {
        tripService.validateTripMembership(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        // If place already selected, return existing
        Optional<TripSelectedPlace> existing = selectedPlaceRepository.findByTripIdAndNameIgnoreCase(tripId, place.getName());
        if (existing.isPresent()) {
            return existing.get();
        }

        place.setTrip(trip);
        TripSelectedPlace saved = selectedPlaceRepository.save(place);

        // Auto regenerate itinerary whenever user selects or updates places!
        generateInitialItinerary(tripId);

        return saved;
    }

    @Transactional
    public void removeSelectedPlace(Long tripId, Long userId, String placeName) {
        tripService.validateTripMembership(tripId, userId);
        selectedPlaceRepository.deleteByTripIdAndNameIgnoreCase(tripId, placeName);

        // Auto regenerate itinerary
        generateInitialItinerary(tripId);
    }

    // --- Hotel Selection API ---
    public Optional<TripSelectedHotel> getSelectedHotel(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return selectedHotelRepository.findFirstByTripIdOrderByIdDesc(tripId);
    }

    @Transactional
    public TripSelectedHotel selectHotel(Long tripId, Long userId, TripSelectedHotel hotel) {
        tripService.validateTripMembership(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        // User can only have one primary hotel per trip for simplicity
        selectedHotelRepository.deleteByTripId(tripId);

        hotel.setTrip(trip);
        TripSelectedHotel saved = selectedHotelRepository.save(hotel);

        // Auto regenerate itinerary with new hotel!
        generateInitialItinerary(tripId);

        return saved;
    }

    @Transactional
    public void removeSelectedHotel(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        selectedHotelRepository.deleteByTripId(tripId);

        // Auto regenerate itinerary
        generateInitialItinerary(tripId);
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
                .imageUrl(request.getImageUrl())
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
                .imageUrl(act.getImageUrl())
                .build();
    }

    @Transactional
    public void deleteActivity(Long tripId, Long activityId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        activityRepository.deleteById(activityId);
    }
}
