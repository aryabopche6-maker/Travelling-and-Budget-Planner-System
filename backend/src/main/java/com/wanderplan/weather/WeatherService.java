package com.wanderplan.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderplan.itinerary.ItineraryActivity;
import com.wanderplan.itinerary.ItineraryDay;
import com.wanderplan.itinerary.ItineraryDayRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.exception.BadRequestException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final int MAX_FORECAST_DAYS = 16;
    private static final long GEOCODING_INTERVAL_MS = 1_000;
    private static final Map<String, Coordinates> GEOCODE_CACHE = new ConcurrentHashMap<>();
    private static long lastGeocodingRequestAt;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private ItineraryDayRepository itineraryDayRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherForecastResponse getWeatherForTrip(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        String destination = trip.getDestination();
        if (destination == null || destination.isBlank()) {
            throw new WeatherUnavailableException("Add a trip destination to view its weather forecast.");
        }

        try {
            return fetchOpenMeteoForecast(destination, trip);
        } catch (BadRequestException e) {
            throw e;
        } catch (WeatherUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch live weather for trip {} destination {}: {}", tripId, destination, e.getMessage());
            throw new WeatherUnavailableException("Live weather is temporarily unavailable. Please try again shortly.", e);
        }
    }

    private WeatherForecastResponse fetchOpenMeteoForecast(String destination, Trip trip) throws Exception {
        Coordinates coordinates = resolveCoordinates(destination);

        double latitude = coordinates.latitude();
        double longitude = coordinates.longitude();
        String forecastUrl = UriComponentsBuilder.fromUriString("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", "temperature_2m,weather_code,wind_speed_10m")
                .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max")
                .queryParam("forecast_days", MAX_FORECAST_DAYS)
                .queryParam("timezone", "auto")
                .toUriString();

        String forecastJson = restTemplate.getForObject(forecastUrl, String.class);
        JsonNode root = objectMapper.readTree(forecastJson);
        JsonNode current = root.path("current");
        JsonNode daily = root.path("daily");
        JsonNode dates = daily.path("time");
        if (!current.isObject() || !dates.isArray() || dates.isEmpty()) {
            throw new WeatherUnavailableException("The weather provider returned an incomplete forecast. Please try again.");
        }

        LocalDate today = LocalDate.parse(dates.get(0).asText());
        LocalDate forecastEnd = today.plusDays(MAX_FORECAST_DAYS - 1);
        JsonNode currentTempNode = current.path("temperature_2m");
        JsonNode currentCodeNode = current.path("weather_code");
        JsonNode currentWindNode = current.path("wind_speed_10m");
        if (!currentTempNode.isNumber() || !currentCodeNode.isNumber() || !currentWindNode.isNumber()) {
            throw new WeatherUnavailableException("The weather provider returned incomplete current conditions.");
        }

        ForecastRange range = selectForecastRange(trip, today, forecastEnd);
        List<WeatherForecastResponse.DailyForecastDto> forecasts = new ArrayList<>();
        List<WeatherForecastResponse.WeatherConflictDto> conflicts = new ArrayList<>();
        List<ItineraryDay> itineraryDays = itineraryDayRepository.findWithActivitiesByTripId(trip.getId());
        JsonNode maxTemps = daily.path("temperature_2m_max");
        JsonNode minTemps = daily.path("temperature_2m_min");
        JsonNode rainProbabilities = daily.path("precipitation_probability_max");
        JsonNode weatherCodes = daily.path("weather_code");

        for (int i = 0; i < dates.size(); i++) {
            String date = dates.get(i).asText();
            LocalDate forecastDate = LocalDate.parse(date);
            if (forecastDate.isBefore(range.start()) || forecastDate.isAfter(range.end())) {
                continue;
            }

            JsonNode maxTemp = maxTemps.path(i);
            JsonNode minTemp = minTemps.path(i);
            JsonNode rainProbability = rainProbabilities.path(i);
            JsonNode codeNode = weatherCodes.path(i);
            if (!maxTemp.isNumber() || !minTemp.isNumber() || !codeNode.isNumber()) {
                throw new WeatherUnavailableException("The weather provider returned incomplete daily forecast data.");
            }

            int code = codeNode.asInt();
            int rainChance = rainProbability.isNumber() ? rainProbability.asInt() : 0;
            String condition = mapWeatherCodeToCondition(code);
            forecasts.add(WeatherForecastResponse.DailyForecastDto.builder()
                    .date(date)
                    .tempMax(round(maxTemp.asDouble()))
                    .tempMin(round(minTemp.asDouble()))
                    .condition(condition)
                    .rainProbability(rainChance)
                    .icon(mapWeatherCodeToIcon(code))
                    .build());

            if (rainChance >= 60) {
                ItineraryDay itineraryDay = findItineraryDayForDate(itineraryDays, forecastDate);
                String outdoorActivity = findOutdoorActivity(itineraryDay);
                conflicts.add(WeatherForecastResponse.WeatherConflictDto.builder()
                        .date(date)
                        .activityTitle(outdoorActivity != null ? outdoorActivity : "Outdoor activities")
                        .warningMessage("High rain probability (" + rainChance + "%) predicted. Rain condition: " + condition)
                        .suggestedAlternative("Consider an indoor museum, cultural show, or cafe visit.")
                        .budgetImpact(0.0)
                        .itineraryDayId(itineraryDay != null ? itineraryDay.getId() : null)
                        .build());
            }
        }

        if (forecasts.isEmpty()) {
            throw new WeatherUnavailableException("A reliable forecast is not available for this trip date range yet. Weather forecasts are currently available for the next 16 days.");
        }

        return WeatherForecastResponse.builder()
                .destination(destination)
                .currentTemperature(round(currentTempNode.asDouble()))
                .currentCondition(mapWeatherCodeToCondition(currentCodeNode.asInt()))
                .rainProbability(forecasts.get(0).getRainProbability())
                .windSpeed(round(currentWindNode.asDouble()))
                .dailyForecasts(forecasts)
                .weatherConflicts(conflicts)
                .forecastSource("Open-Meteo")
                .forecastNote(range.note())
                .build();
    }

    private synchronized Coordinates resolveCoordinates(String destination) throws Exception {
        String cacheKey = destination.trim().toLowerCase(Locale.ROOT);
        Coordinates cached = GEOCODE_CACHE.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        long waitMillis = GEOCODING_INTERVAL_MS - (System.currentTimeMillis() - lastGeocodingRequestAt);
        if (waitMillis > 0) {
            try {
                Thread.sleep(waitMillis);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new WeatherUnavailableException("Weather location lookup was interrupted. Please try again.", e);
            }
        }
        lastGeocodingRequestAt = System.currentTimeMillis();

        String geocodingUrl = UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", destination)
                .queryParam("format", "jsonv2")
                .queryParam("limit", 1)
                .toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, "WanderPlan/1.0 (trip weather forecast)");
        ResponseEntity<String> response = restTemplate.exchange(
                geocodingUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
        JsonNode results = objectMapper.readTree(response.getBody());
        if (!results.isArray() || results.isEmpty()) {
            throw new BadRequestException("Could not find weather data for \"" + destination + "\". Check the trip destination spelling.");
        }

        JsonNode location = results.get(0);
        JsonNode latitude = location.path("lat");
        JsonNode longitude = location.path("lon");
        if (latitude.isMissingNode() || longitude.isMissingNode()) {
            throw new WeatherUnavailableException("The destination could not be matched to a weather location.");
        }
        double lat;
        double lon;
        try {
            lat = Double.parseDouble(latitude.asText());
            lon = Double.parseDouble(longitude.asText());
        } catch (NumberFormatException e) {
            throw new WeatherUnavailableException("The destination geocoder returned invalid coordinates.", e);
        }
        if (!Double.isFinite(lat) || !Double.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new WeatherUnavailableException("The destination geocoder returned coordinates outside valid bounds.");
        }
        Coordinates coordinates = new Coordinates(lat, lon);
        if (GEOCODE_CACHE.size() >= 500) {
            GEOCODE_CACHE.clear();
        }
        GEOCODE_CACHE.put(cacheKey, coordinates);
        return coordinates;
    }

    private ForecastRange selectForecastRange(Trip trip, LocalDate today, LocalDate forecastEnd) {
        LocalDate tripStart = trip.getStartDate();
        LocalDate tripEnd = trip.getEndDate();
        LocalDate rangeStart = today;
        LocalDate rangeEnd = today.plusDays(6);
        String note = "Forecast for the next 7 days.";

        if (tripStart != null && !tripStart.isAfter(forecastEnd) && (tripEnd == null || !tripEnd.isBefore(today))) {
            rangeStart = tripStart.isBefore(today) ? today : tripStart;
            LocalDate requestedEnd = tripEnd == null ? rangeStart.plusDays(6) : tripEnd;
            rangeEnd = requestedEnd.isAfter(forecastEnd) ? forecastEnd : requestedEnd;
            if (requestedEnd.isAfter(forecastEnd)) {
                note = "Showing the available forecast through " + forecastEnd + "; later trip dates are outside the 16-day forecast window.";
            } else {
                note = "Forecast matched to your trip dates.";
            }
        } else if (tripStart != null) {
            note = "Your trip dates are outside the reliable 16-day forecast window. Showing the upcoming forecast instead.";
        }

        return new ForecastRange(rangeStart, rangeEnd, note);
    }

    private ItineraryDay findItineraryDayForDate(List<ItineraryDay> days, LocalDate date) {
        for (ItineraryDay day : days) {
            if (date.equals(day.getDate())) {
                return day;
            }
        }
        return null;
    }

    private String findOutdoorActivity(ItineraryDay day) {
        if (day == null || day.getActivities() == null) {
            return null;
        }
        for (ItineraryActivity activity : day.getActivities()) {
            if (Boolean.TRUE.equals(activity.getIsOutdoor())) {
                return activity.getTitle();
            }
        }
        return null;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String mapWeatherCodeToCondition(int code) {
        return switch (code) {
            case 0 -> "Sunny & Clear";
            case 1, 2, 3 -> "Partly Cloudy";
            case 45, 48 -> "Foggy";
            case 51, 53, 55 -> "Light Drizzle";
            case 61, 63 -> "Moderate Rain";
            case 65 -> "Heavy Rain";
            case 71, 73, 75 -> "Snow Fall";
            case 80, 81, 82 -> "Rain Showers";
            case 95, 96, 99 -> "Thunderstorm";
            default -> "Unknown";
        };
    }

    private String mapWeatherCodeToIcon(int code) {
        return switch (code) {
            case 0 -> "sun";
            case 1, 2, 3 -> "cloud-sun";
            case 45, 48 -> "cloud";
            case 51, 53, 55, 61, 63, 65, 80, 81, 82 -> "cloud-rain";
            case 71, 73, 75 -> "snowflake";
            case 95, 96, 99 -> "cloud-lightning";
            default -> "cloud";
        };
    }

    private record ForecastRange(LocalDate start, LocalDate end, String note) {}
    private record Coordinates(double latitude, double longitude) {}
}
