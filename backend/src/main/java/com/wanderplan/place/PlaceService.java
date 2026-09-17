package com.wanderplan.place;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlaceService {

    private static final Logger log = LoggerFactory.getLogger(PlaceService.class);

    @Value("${app.external.places.api-key:NO_KEY}")
    private String placesApiKey;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<PlaceResponse> getPlacesForTrip(Long tripId, Long userId, String location, int radius) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId).orElse(null);
        String destination = trip != null ? trip.getDestination() : "Goa";
        
        String searchArea = (location != null && !location.trim().isEmpty()) ? location.trim() : destination;
        String geocodeTarget = searchArea;
        if (!searchArea.equalsIgnoreCase(destination)) {
            geocodeTarget = searchArea + ", " + destination;
        }

        // Try Geoapify Places API if API key is configured
        if (isExternalApiConfigured()) {
            try {
                List<PlaceResponse> geoapifyPlaces = fetchGeoapifyPlaces(searchArea, radius);
                if (geoapifyPlaces != null && !geoapifyPlaces.isEmpty()) {
                    return geoapifyPlaces;
                }
            } catch (Exception e) {
                log.warn("Geoapify Places API call failed, falling back to OpenStreetMap Overpass: {}", e.getMessage());
            }
        }

        // Live primary provider: OpenStreetMap Nominatim Geocoding + Overpass API
        try {
            return fetchOsmPlaces(geocodeTarget, destination, radius);
        } catch (Exception e) {
            log.error("Failed to fetch live places from OSM for {}: {}", geocodeTarget, e.getMessage());
            return buildFallbackPlaces(searchArea, 15.2993, 74.1240);
        }
    }

    private List<PlaceResponse> fetchOsmPlaces(String geocodeTarget, String cleanCity, int radiusKm) {
        List<PlaceResponse> places = new ArrayList<>();

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
                    "  node[\"tourism\"~\"attraction|museum|viewpoint|gallery\"](around:%d,%f,%f);" +
                    "  node[\"historic\"](around:%d,%f,%f);" +
                    "  node[\"leisure\"~\"park|nature_reserve\"](around:%d,%f,%f);" +
                    ");" +
                    "out center 20;", radiusMeters, lat, lon, radiusMeters, lat, lon, radiusMeters, lat, lon);

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
                    if (places.size() >= 15) break; // Limit to 15 results
                    JsonNode tags = elem.path("tags");
                    String name = tags.path("name:en").asText(tags.path("name").asText(""));
                    if (name.isBlank()) continue;
                    
                    // Prevent duplicate names
                    boolean exists = places.stream().anyMatch(p -> p.getName().equalsIgnoreCase(name));
                    if (exists) continue;

                    places.add(PlaceResponse.builder()
                            .id("osm-op-" + elem.path("id").asText())
                            .name(name)
                            .category(deriveCategory(tags))
                            .rating(null)
                            .location(cleanCity)
                            .estimatedCost(null)
                            .duration(null)
                            .description("Landmark located in " + cleanCity)
                            .imageUrl(fetchWikipediaImage(name))
                            .latitude(elem.path("lat").asDouble(lat))
                            .longitude(elem.path("lon").asDouble(lon))
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("Overpass API query timed out or unavailable: {}", e.getMessage());
        }

        if (places.isEmpty()) {
            return buildFallbackPlaces(cleanCity, lat, lon);
        }

        return places;
    }

    private List<PlaceResponse> fetchGeoapifyPlaces(String destination, int radiusKm) throws Exception {
        String cleanCity = destination.split(",")[0].trim();
        double[] coords = geocodeLocation(cleanCity);
        String url;
        
        if (coords != null) {
            int radiusMeters = radiusKm * 1000;
            url = UriComponentsBuilder.fromHttpUrl("https://api.geoapify.com/v2/places")
                    .queryParam("categories", "tourism.attraction,tourism.sights,entertainment.museum")
                    .queryParam("filter", String.format("circle:%f,%f,%d", coords[1], coords[0], radiusMeters))
                    .queryParam("limit", 15)
                    .queryParam("apiKey", placesApiKey)
                    .toUriString();
        } else {
            url = UriComponentsBuilder.fromHttpUrl("https://api.geoapify.com/v2/places")
                    .queryParam("categories", "tourism.attraction,tourism.sights,entertainment.museum")
                    .queryParam("filter", "text:" + URLEncoder.encode(cleanCity, StandardCharsets.UTF_8))
                    .queryParam("limit", 15)
                    .queryParam("apiKey", placesApiKey)
                    .toUriString();
        }

        String json = restTemplate.getForObject(url, String.class);
        JsonNode root = objectMapper.readTree(json);
        JsonNode features = root.path("features");

        if (!features.isArray() || features.isEmpty()) return null;

        List<PlaceResponse> places = new ArrayList<>();
        for (JsonNode feat : features) {
            JsonNode props = feat.path("properties");
            String name = props.path("name").asText("");
            if (name.isBlank()) continue;

            String address = props.path("formatted").asText(cleanCity);
            double lat = props.path("lat").asDouble(0.0);
            double lon = props.path("lon").asDouble(0.0);
            String placeId = props.path("place_id").asText("geo-" + System.currentTimeMillis());

            places.add(PlaceResponse.builder()
                    .id(placeId)
                    .name(name)
                    .category("Sightseeing")
                    .rating(null)
                    .location(address)
                    .estimatedCost(null)
                    .duration(null)
                    .description("Attraction located at " + address)
                    .imageUrl(null)
                    .latitude(lat)
                    .longitude(lon)
                    .build());
        }

        return places;
    }

    private String deriveCategory(JsonNode tags) {
        if (tags.has("historic")) return "History & Heritage";
        if (tags.has("tourism")) {
            String tour = tags.path("tourism").asText();
            if ("museum".equalsIgnoreCase(tour) || "gallery".equalsIgnoreCase(tour)) return "Museums & Art";
            if ("viewpoint".equalsIgnoreCase(tour)) return "Nature & Viewpoints";
            if ("theme_park".equalsIgnoreCase(tour) || "zoo".equalsIgnoreCase(tour)) return "Entertainment";
        }
        if (tags.has("leisure")) return "Parks & Nature";
        return "Sightseeing & Culture";
    }

    private List<PlaceResponse> buildFallbackPlaces(String destination, double lat, double lon) {
        List<PlaceResponse> places = new ArrayList<>();
        places.add(PlaceResponse.builder()
                .id("fallback-1")
                .name(destination + " Heritage Square & Old Town")
                .category("History & Heritage")
                .rating(null)
                .location(destination)
                .estimatedCost(null)
                .duration(null)
                .description("Explore the historic center, colonial architecture, and lively markets.")
                .imageUrl(fetchWikipediaImage(destination)) // Use destination name for fallback image
                .latitude(lat)
                .longitude(lon)
                .build());
        return places;
    }

    public boolean isExternalApiConfigured() {
        return placesApiKey != null && !placesApiKey.equals("NO_KEY") && !placesApiKey.isBlank();
    }

    private double[] geocodeLocation(String location) {
        try {
            String nominatimUrl = "https://nominatim.openstreetmap.org/search?q=" + URLEncoder.encode(location, StandardCharsets.UTF_8) + "&format=json&limit=1";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WanderPlan-Travel-App/1.0 (contact@wanderplan.com)");
            String geoJson = restTemplate.exchange(nominatimUrl, org.springframework.http.HttpMethod.GET, new HttpEntity<>(headers), String.class).getBody();
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
