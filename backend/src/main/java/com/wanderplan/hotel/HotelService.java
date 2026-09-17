package com.wanderplan.hotel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class HotelService {

    private static final Logger log = LoggerFactory.getLogger(HotelService.class);

    @Value("${app.external.hotels.api-key:NO_KEY}")
    private String hotelApiKey;

    @Value("${app.external.hotels.client-id:NO_KEY}")
    private String amadeusClientId;

    @Value("${app.external.hotels.client-secret:NO_KEY}")
    private String amadeusClientSecret;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<HotelResponse> getHotelsForTrip(Long tripId, Long userId, String location, int radius) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId).orElse(null);
        String destination = trip != null ? trip.getDestination() : "Goa";
        
        String searchArea = (location != null && !location.trim().isEmpty()) ? location.trim() : destination;
        String geocodeTarget = searchArea;
        if (!searchArea.equalsIgnoreCase(destination)) {
            geocodeTarget = searchArea + ", " + destination;
        }

        // 1. Try Amadeus Live Hotel API if credentials are provided
        if (isAmadeusConfigured()) {
            try {
                List<HotelResponse> amadeusHotels = fetchAmadeusHotels(searchArea, radius);
                if (amadeusHotels != null && !amadeusHotels.isEmpty()) {
                    return amadeusHotels;
                }
            } catch (Exception e) {
                log.warn("Amadeus Hotel API call failed, falling back to OpenStreetMap accommodations: {}", e.getMessage());
            }
        }

        // 2. Primary Live Open Provider: OpenStreetMap Accommodations (real hotel names & locations)
        try {
            return fetchOsmHotels(geocodeTarget, destination, radius);
        } catch (Exception e) {
            log.error("Failed to fetch live hotels from OSM for {}: {}", geocodeTarget, e.getMessage());
            return buildFallbackHotels(searchArea, 15.2993, 74.1240);
        }
    }

    private List<HotelResponse> fetchOsmHotels(String geocodeTarget, String cleanCity, int radiusKm) {
        List<HotelResponse> hotels = new ArrayList<>();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "WanderPlan-Travel-App/1.0 (contact@wanderplan.com)");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        double[] coords = geocodeLocation(geocodeTarget);
        double lat = coords != null ? coords[0] : 15.2993;
        double lon = coords != null ? coords[1] : 74.1240;

        int radiusMeters = radiusKm * 1000;

        // Rely completely on Overpass API for strict area-based radius search
        try {
            String overpassQuery = String.format(
                    "[out:json][timeout:5];" +
                    "(" +
                    "  node[\"tourism\"~\"hotel|resort|hostel|motel|guest_house\"](around:%d,%f,%f);" +
                    ");" +
                    "out center 15;", radiusMeters, lat, lon);

            String overpassUrl = "https://overpass-api.de/api/interpreter";
            HttpHeaders overpassHeaders = new HttpHeaders();
            overpassHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            overpassHeaders.set("User-Agent", "WanderPlan-Travel-App/1.0 (contact@wanderplan.com)");

            HttpEntity<String> overpassEntity = new HttpEntity<>("data=" + URLEncoder.encode(overpassQuery, StandardCharsets.UTF_8), overpassHeaders);
            String overpassJson = restTemplate.postForObject(overpassUrl, overpassEntity, String.class);

            JsonNode overpassRoot = objectMapper.readTree(overpassJson);
            JsonNode elements = overpassRoot.path("elements");
            if (elements.isArray()) {
                for (JsonNode elem : elements) {
                    if (hotels.size() >= 12) break; // Limit to 12 results
                    JsonNode tags = elem.path("tags");
                    String name = tags.path("name:en").asText(tags.path("name").asText(""));
                    if (name.isBlank()) continue;

                    // Prevent duplicate names
                    boolean exists = hotels.stream().anyMatch(h -> h.getName().equalsIgnoreCase(name));
                    if (exists) continue;

                    Double stars = tags.has("stars") ? tags.path("stars").asDouble() : null;
                    hotels.add(HotelResponse.builder()
                            .id("osm-op-" + elem.path("id").asText())
                            .name(name)
                            .imageUrl(fetchWikipediaImage(name))
                            .rating(stars)
                            .location(cleanCity)
                            .pricePerNight(null)
                            .currency("INR")
                            .amenities(deriveAmenities(tags))
                            .availabilityStatus("CHECK_ONLINE")
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("Overpass hotel query timed out or unavailable: {}", e.getMessage());
        }

        if (hotels.isEmpty()) {
            return buildFallbackHotels(cleanCity, lat, lon);
        }

        return hotels;
    }

    private List<HotelResponse> fetchAmadeusHotels(String destination, int radiusKm) throws Exception {
        String token = getAmadeusToken();
        if (token == null) return null;

        String cleanCity = destination.split(",")[0].trim();
        
        double[] coords = geocodeLocation(cleanCity);
        double lat = coords != null ? coords[0] : 15.2993;
        double lon = coords != null ? coords[1] : 74.1240;

        String amadeusUrl = UriComponentsBuilder.fromHttpUrl("https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode")
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("radius", radiusKm > 0 ? radiusKm : 5)
                .queryParam("radiusUnit", "KM")
                .toUriString();

        HttpHeaders amadeusHeaders = new HttpHeaders();
        amadeusHeaders.setBearerAuth(token);
        HttpEntity<Void> request = new HttpEntity<>(amadeusHeaders);

        ResponseEntity<String> response = restTemplate.exchange(amadeusUrl, HttpMethod.GET, request, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode data = root.path("data");

        if (!data.isArray() || data.isEmpty()) return null;

        List<HotelResponse> hotels = new ArrayList<>();
        for (int i = 0; i < Math.min(data.size(), 10); i++) {
            JsonNode item = data.get(i);
            String name = item.path("name").asText("Hotel");
            String hotelId = item.path("hotelId").asText("h" + i);
            double rating = item.path("rating").asDouble(0.0);

            hotels.add(HotelResponse.builder()
                    .id("amadeus-" + hotelId)
                    .name(name)
                    .imageUrl(null)
                    .rating(rating > 0 ? rating : null)
                    .location(cleanCity)
                    .pricePerNight(null) // Specific offers require secondary /v3/shopping/hotel-offers query
                    .currency("INR")
                    .amenities(Arrays.asList("Verified Accommodation", "Online Booking"))
                    .availabilityStatus("AVAILABLE")
                    .build());
        }

        return hotels;
    }

    private String getAmadeusToken() {
        try {
            String tokenUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", amadeusClientId);
            body.add("client_secret", amadeusClientSecret);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

            JsonNode node = objectMapper.readTree(response.getBody());
            return node.path("access_token").asText(null);
        } catch (Exception e) {
            log.error("Failed to authenticate with Amadeus API: {}", e.getMessage());
            return null;
        }
    }

    private List<HotelResponse> buildFallbackHotels(String destination, double lat, double lon) {
        List<HotelResponse> hotels = new ArrayList<>();
        hotels.add(HotelResponse.builder()
                .id("osm-fallback-1")
                .name(destination + " Central Hotel")
                .imageUrl(fetchWikipediaImage(destination)) // Use destination name for fallback image
                .rating(null)
                .location(destination)
                .pricePerNight(null)
                .currency("INR")
                .amenities(Arrays.asList("Free WiFi"))
                .availabilityStatus("CHECK_ONLINE")
                .build());
        return hotels;
    }

    public boolean isExternalApiConfigured() {
        return isAmadeusConfigured() || (hotelApiKey != null && !hotelApiKey.equals("NO_KEY") && !hotelApiKey.isBlank());
    }

    public boolean isAmadeusConfigured() {
        return amadeusClientId != null && !amadeusClientId.equals("NO_KEY") && !amadeusClientId.isBlank() &&
               amadeusClientSecret != null && !amadeusClientSecret.equals("NO_KEY") && !amadeusClientSecret.isBlank();
    }

    private double[] geocodeLocation(String location) {
        try {
            String nominatimUrl = "https://nominatim.openstreetmap.org/search?q=" + URLEncoder.encode(location, StandardCharsets.UTF_8) + "&format=json&limit=1";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WanderPlan-Travel-App/1.0 (contact@wanderplan.com)");
            String geoJson = restTemplate.exchange(nominatimUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class).getBody();
            JsonNode geoRoot = objectMapper.readTree(geoJson);

            if (geoRoot.isArray() && !geoRoot.isEmpty()) {
                double lat = geoRoot.get(0).path("lat").asDouble(0.0);
                double lon = geoRoot.get(0).path("lon").asDouble(0.0);
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            log.error("Geocoding failed for {}: {}", location, e.getMessage());
        }
        return null;
    }

    private List<String> deriveAmenities(JsonNode tags) {
        List<String> amenities = new ArrayList<>();
        if (tags.has("internet_access") && !tags.path("internet_access").asText().equals("no")) {
            amenities.add("WiFi");
        }
        if (tags.has("air_conditioning") && tags.path("air_conditioning").asText().equals("yes")) {
            amenities.add("A/C");
        }
        if (tags.has("swimming_pool") && tags.path("swimming_pool").asText().equals("yes")) {
            amenities.add("Pool");
        }
        if (tags.has("wheelchair") && tags.path("wheelchair").asText().equals("yes")) {
            amenities.add("Wheelchair Accessible");
        }
        if (amenities.isEmpty()) {
            amenities.add("Verified Accommodation");
        }
        return amenities;
    }

    private String fetchWikipediaImage(String title) {
        try {
            String wikiUrl = "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" 
                             + URLEncoder.encode(title, StandardCharsets.UTF_8)
                             + "&gsrlimit=1&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=600";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WanderPlan-Travel-App/1.0 (contact@wanderplan.com)");
            String json = restTemplate.exchange(wikiUrl, org.springframework.http.HttpMethod.GET, new HttpEntity<>(headers), String.class).getBody();
            JsonNode root = objectMapper.readTree(json);
            JsonNode pages = root.path("query").path("pages");
            if (pages.isObject() && !pages.isEmpty()) {
                JsonNode firstPage = pages.elements().next();
                if (firstPage.has("thumbnail")) {
                    return firstPage.path("thumbnail").path("source").asText();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch image from Wikipedia for {}: {}", title, e.getMessage());
        }
        return null;
    }
}