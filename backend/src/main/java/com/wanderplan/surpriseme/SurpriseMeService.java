package com.wanderplan.surpriseme;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SurpriseMeService {

    private static final List<Destination> DESTINATIONS = List.of(
            new Destination("Rishikesh", "India", 1600,
                    "Train / Bus", "Riverside Hostel & Eco-Camp",
                    List.of("Ganga River Rafting", "Sunset Aarti at Triveni Ghat", "Waterfall Trekking", "Cliff Jumping"),
                    Set.of("adventure", "nature", "culture"), Set.of("active", "balanced"),
                    "A low-cost base for river adventures, yoga and Himalayan foothills."),
            new Destination("Jaipur", "India", 2100,
                    "Train / Bus", "Heritage Guesthouse",
                    List.of("Amber Fort", "Hawa Mahal", "Jantar Mantar", "Local food walk"),
                    Set.of("culture", "food"), Set.of("relaxed", "balanced"),
                    "A strong-value city break for forts, local food and Rajasthani heritage."),
            new Destination("Hampi", "India", 2500,
                    "Train / Bus", "Guesthouse",
                    List.of("Virupaksha Temple", "Boulder Hill Hike", "Vijaya Vittala Temple", "Tungabhadra River"),
                    Set.of("culture", "adventure", "nature"), Set.of("active", "balanced"),
                    "A history-rich, outdoorsy escape among the Vijayanagara ruins."),
            new Destination("Goa", "India", 4200,
                    "Train / Flight", "3-Star Beach Resort",
                    List.of("Anjuna Flea Market", "Scuba Diving at Grand Island", "Dudhsagar Waterfalls Tour", "Mandovi River sunset cruise"),
                    Set.of("beach", "food", "nightlife", "adventure"), Set.of("balanced", "active"),
                    "A beach trip with seafood, water activities and lively evening options."),
            new Destination("Kerala", "India", 5600,
                    "Train / Flight", "Backwater Homestay",
                    List.of("Alleppey backwaters", "Munnar tea gardens", "Kochi heritage walk", "Local cooking experience"),
                    Set.of("nature", "beach", "food", "culture"), Set.of("relaxed", "balanced"),
                    "A slower-paced mix of backwaters, green landscapes and regional cuisine."),
            new Destination("Bali", "Indonesia", 10500,
                    "International Flight", "Private Pool Villa in Ubud",
                    List.of("Sacred Monkey Forest Sanctuary", "Sunrise Trek to Mount Batur", "Tegenungan Waterfall", "Seminyak Beach Club Sunset"),
                    Set.of("beach", "nature", "culture", "adventure"), Set.of("relaxed", "balanced"),
                    "A premium island stay combining temples, beaches and lush landscapes.")
    );

    public SurpriseMeResponse generateSurpriseTrip(SurpriseMeRequest request) {
        int days = request.getDays() != null ? request.getDays() : 5;
        int travelers = request.getTravelers() != null ? request.getTravelers() : 1;
        double budget = request.getBudget();

        List<Destination> affordable = DESTINATIONS.stream()
                .filter(destination -> destination.estimatedDailyCost() * days * travelers <= budget)
                .toList();
        if (affordable.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The budget is below the estimated minimum for this group and trip duration.");
        }

        Set<String> interests = normalize(request.getInterests());
        String pace = normalize(request.getTravelPace());
        Destination selected = affordable.stream()
                .max(Comparator
                        .comparingInt((Destination destination) -> overlapCount(destination.interests(), interests))
                        .thenComparingInt(destination -> destination.travelPaces().contains(pace) ? 1 : 0)
                        .thenComparingDouble(Destination::estimatedDailyCost))
                .orElseThrow();
        double estimate = selected.estimatedDailyCost() * days * travelers;

        String reason = selected.description()
                + " Estimated for " + travelers + (travelers == 1 ? " traveler" : " travelers")
                + " over " + days + (days == 1 ? " day" : " days") + ".";
        if (!interests.isEmpty()) {
            reason += " Selected to match your interests: " + String.join(", ", interests) + ".";
        }
        if (!pace.isBlank()) {
            reason += " It suits a " + pace + " travel pace.";
        }
        if (request.getStartingLocation() != null && !request.getStartingLocation().isBlank()) {
            reason += " Travel planning starts from " + request.getStartingLocation().trim() + ".";
        }

        int activityCount = Math.min(days, selected.activities().size());
        return SurpriseMeResponse.builder()
                .suggestedDestination(selected.name())
                .country(selected.country())
                .matchReason(reason)
                .estimatedTotalBudget(estimate)
                .recommendedTravelMode(selected.travelMode())
                .recommendedHotelTier(selected.hotelTier())
                .suggestedActivities(selected.activities().subList(0, activityCount))
                .imageUrl(selected.imageUrl())
                .build();
    }

    private Set<String> normalize(List<String> values) {
        if (values == null) {
            return Set.of();
        }
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private int overlapCount(Set<String> destinationInterests, Set<String> selectedInterests) {
        return (int) destinationInterests.stream().filter(selectedInterests::contains).count();
    }

    private record Destination(
            String name,
            String country,
            double estimatedDailyCost,
            String travelMode,
            String hotelTier,
            List<String> activities,
            Set<String> interests,
            Set<String> travelPaces,
            String description) {
        private String imageUrl() {
            return switch (name) {
                case "Rishikesh" -> "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80";
                case "Jaipur" -> "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80";
                case "Hampi" -> "https://images.unsplash.com/photo-1600100397608-f010b4a77c7e?auto=format&fit=crop&w=800&q=80";
                case "Goa" -> "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80";
                case "Kerala" -> "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80";
                default -> "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80";
            };
        }
    }
}
