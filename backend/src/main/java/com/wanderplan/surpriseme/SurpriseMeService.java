package com.wanderplan.surpriseme;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class SurpriseMeService {

    private final Random random = new Random();

    public SurpriseMeResponse generateSurpriseTrip(SurpriseMeRequest request) {
        double budget = request.getBudget() != null ? request.getBudget() : 50000.0;
        int days = request.getDays() != null ? request.getDays() : 5;

        // Destination recommendation based on budget
        if (budget < 25000) {
            return SurpriseMeResponse.builder()
                    .suggestedDestination("Rishikesh")
                    .country("India")
                    .matchReason("Perfect budget-friendly adventure hub with white-water rafting, serene river yoga, and vibrant backpacker cafes.")
                    .estimatedTotalBudget(18500.0)
                    .recommendedTravelMode("Train / Bus")
                    .recommendedHotelTier("Riverside Hostel & Eco-Camp")
                    .suggestedActivities(Arrays.asList("Ganga River Rafting", "Sunset Aarti at Triveni Ghat", "Waterfall Trekking", "Cliff Jumping"))
                    .imageUrl("https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80")
                    .build();
        } else if (budget < 80000) {
            return SurpriseMeResponse.builder()
                    .suggestedDestination("Goa")
                    .country("India")
                    .matchReason("Matches your desire for sun-soaked beaches, Portuguese heritage architecture, vibrant night markets, and seafood delicacies.")
                    .estimatedTotalBudget(45000.0)
                    .recommendedTravelMode("Flight")
                    .recommendedHotelTier("3-Star Beach Resort")
                    .suggestedActivities(Arrays.asList("Anjuna Flea Market", "Scuba Diving at Grand Island", "Dudhsagar Waterfalls Tour", "Sunset Cruise on Mandovi River"))
                    .imageUrl("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80")
                    .build();
        } else {
            return SurpriseMeResponse.builder()
                    .suggestedDestination("Bali")
                    .country("Indonesia")
                    .matchReason("Ideal premium tropical paradise matching your style with lush rice terraces, luxury cliffside villas, and rich Hindu temple culture.")
                    .estimatedTotalBudget(110000.0)
                    .recommendedTravelMode("International Flight")
                    .recommendedHotelTier("Private Pool Villa in Ubud")
                    .suggestedActivities(Arrays.asList("Sacred Monkey Forest Sanctuary", "Sunrise Trek to Mount Batur", "Tegenungan Waterfall", "Seminyak Beach Club Sunset"))
                    .imageUrl("https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80")
                    .build();
        }
    }
}
