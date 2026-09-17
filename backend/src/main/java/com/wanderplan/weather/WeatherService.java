package com.wanderplan.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderplan.itinerary.ItineraryActivity;
import com.wanderplan.itinerary.ItineraryDay;
import com.wanderplan.itinerary.ItineraryDayRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    @Value("${app.external.weather.api-key:NO_KEY}")
    private String weatherApiKey;

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

        Trip trip = tripRepository.findById(tripId).orElse(null);
        String destination = trip != null ? trip.getDestination() : "Goa";

        // Try OpenWeatherMap if API key is configured
        if (isExternalApiConfigured()) {
            try {
                WeatherForecastResponse owmResponse = fetchOpenWeatherMapForecast(destination, trip);
                if (owmResponse != null) {
                    return owmResponse;
                }
            } catch (Exception e) {
                log.warn("OpenWeatherMap API call failed, falling back to Open-Meteo: {}", e.getMessage());
            }
        }

        // Live primary provider: Open-Meteo (Real Global Weather API, zero-key required)
        try {
            return fetchOpenMeteoForecast(destination, trip);
        } catch (Exception e) {
            log.error("Failed to fetch live weather from Open-Meteo for {}: {}", destination, e.getMessage());
            return buildFallbackForecast(destination, trip);
        }
    }

    private WeatherForecastResponse fetchOpenMeteoForecast(String destination, Trip trip) throws Exception {
        // 1. Geocoding to obtain real coordinates for destination
        String cleanCity = destination.split(",")[0].trim();
        String geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + URLEncoder.encode(cleanCity, StandardCharsets.UTF_8) + "&count=1&language=en&format=json";
        
        String geoJson = restTemplate.getForObject(geoUrl, String.class);
        JsonNode geoRoot = objectMapper.readTree(geoJson);
        
        double lat = 15.2993; // default fallback if geocoding yields no results
        double lon = 74.1240;
        
        if (geoRoot.has("results") && geoRoot.get("results").isArray() && geoRoot.get("results").size() > 0) {
            JsonNode firstResult = geoRoot.get("results").get(0);
            lat = firstResult.path("latitude").asDouble(lat);
            lon = firstResult.path("longitude").asDouble(lon);
        }

        // 2. Fetch real 7-day live weather forecast
        String weatherUrl = UriComponentsBuilder.fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("daily", "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max")
                .queryParam("current_weather", true)
                .queryParam("timezone", "auto")
                .toUriString();

        String weatherJson = restTemplate.getForObject(weatherUrl, String.class);
        JsonNode weatherRoot = objectMapper.readTree(weatherJson);

        JsonNode currentWeather = weatherRoot.path("current_weather");
        double currentTemp = currentWeather.path("temperature").asDouble(26.0);
        int currentCode = currentWeather.path("weathercode").asInt(0);
        double currentWind = currentWeather.path("windspeed").asDouble(10.0);

        JsonNode daily = weatherRoot.path("daily");
        JsonNode dates = daily.path("time");
        JsonNode maxTemps = daily.path("temperature_2m_max");
        JsonNode minTemps = daily.path("temperature_2m_min");
        JsonNode rainProbs = daily.path("precipitation_probability_max");
        JsonNode weatherCodes = daily.path("weathercode");

        List<WeatherForecastResponse.DailyForecastDto> dailyForecasts = new ArrayList<>();
        List<WeatherForecastResponse.WeatherConflictDto> conflicts = new ArrayList<>();

        int count = dates.isArray() ? dates.size() : 0;
        for (int i = 0; i < Math.min(count, 7); i++) {
            String dateStr = dates.get(i).asText();
            double tempMax = maxTemps.has(i) ? maxTemps.get(i).asDouble() : currentTemp + 2;
            double tempMin = minTemps.has(i) ? minTemps.get(i).asDouble() : currentTemp - 4;
            int rainProb = rainProbs.has(i) && !rainProbs.get(i).isNull() ? rainProbs.get(i).asInt() : 10;
            int code = weatherCodes.has(i) ? weatherCodes.get(i).asInt() : currentCode;

            String condition = mapWeatherCodeToCondition(code);
            String icon = mapWeatherCodeToIcon(code);

            dailyForecasts.add(WeatherForecastResponse.DailyForecastDto.builder()
                    .date(dateStr)
                    .tempMax(Math.round(tempMax * 10.0) / 10.0)
                    .tempMin(Math.round(tempMin * 10.0) / 10.0)
                    .condition(condition)
                    .rainProbability(rainProb)
                    .icon(icon)
                    .build());

            // Detect rain conflicts with outdoor activities in the trip itinerary
            if (rainProb >= 60) {
                String conflictActivity = findOutdoorActivityForDate(trip, dateStr);
                conflicts.add(WeatherForecastResponse.WeatherConflictDto.builder()
                        .date(dateStr)
                        .activityTitle(conflictActivity != null ? conflictActivity : "Outdoor Sightseeing & Exploration")
                        .warningMessage("High rain probability (" + rainProb + "%) predicted. Rain condition: " + condition)
                        .suggestedAlternative("Schedule indoor museum, cultural show, or cafe visit during peak rain hours.")
                        .budgetImpact(150.0)
                        .build());
            }
        }

        return WeatherForecastResponse.builder()
                .destination(destination)
                .currentTemperature(Math.round(currentTemp * 10.0) / 10.0)
                .currentCondition(mapWeatherCodeToCondition(currentCode))
                .rainProbability(dailyForecasts.isEmpty() ? 10 : dailyForecasts.get(0).getRainProbability())
                .windSpeed(Math.round(currentWind * 10.0) / 10.0)
                .dailyForecasts(dailyForecasts)
                .weatherConflicts(conflicts)
                .build();
    }

    private WeatherForecastResponse fetchOpenWeatherMapForecast(String destination, Trip trip) throws Exception {
        String cleanCity = destination.split(",")[0].trim();
        String url = UriComponentsBuilder.fromHttpUrl("https://api.openweathermap.org/data/2.5/forecast")
                .queryParam("q", cleanCity)
                .queryParam("appid", weatherApiKey)
                .queryParam("units", "metric")
                .toUriString();

        String json = restTemplate.getForObject(url, String.class);
        JsonNode root = objectMapper.readTree(json);
        JsonNode list = root.path("list");

        if (!list.isArray() || list.isEmpty()) return null;

        List<WeatherForecastResponse.DailyForecastDto> dailyForecasts = new ArrayList<>();
        List<WeatherForecastResponse.WeatherConflictDto> conflicts = new ArrayList<>();

        for (int i = 0; i < list.size(); i += 8) { // Sample daily (8 intervals of 3 hours = 24h)
            JsonNode item = list.get(i);
            String dtTxt = item.path("dt_txt").asText("").split(" ")[0];
            JsonNode main = item.path("main");
            double temp = main.path("temp").asDouble(25.0);
            double tempMax = main.path("temp_max").asDouble(temp);
            double tempMin = main.path("temp_min").asDouble(temp);
            int rainProb = (int) Math.round(item.path("pop").asDouble(0.1) * 100);
            
            String condition = "Clear";
            String icon = "sun";
            JsonNode weatherArr = item.path("weather");
            if (weatherArr.isArray() && !weatherArr.isEmpty()) {
                condition = weatherArr.get(0).path("main").asText("Clear");
                icon = mapOwmConditionToIcon(condition);
            }

            dailyForecasts.add(WeatherForecastResponse.DailyForecastDto.builder()
                    .date(dtTxt)
                    .tempMax(Math.round(tempMax * 10.0) / 10.0)
                    .tempMin(Math.round(tempMin * 10.0) / 10.0)
                    .condition(condition)
                    .rainProbability(rainProb)
                    .icon(icon)
                    .build());
        }

        JsonNode firstItem = list.get(0);
        double curTemp = firstItem.path("main").path("temp").asDouble(25.0);
        double curWind = firstItem.path("wind").path("speed").asDouble(10.0);

        return WeatherForecastResponse.builder()
                .destination(destination)
                .currentTemperature(Math.round(curTemp * 10.0) / 10.0)
                .currentCondition(dailyForecasts.isEmpty() ? "Sunny" : dailyForecasts.get(0).getCondition())
                .rainProbability(dailyForecasts.isEmpty() ? 10 : dailyForecasts.get(0).getRainProbability())
                .windSpeed(Math.round(curWind * 10.0) / 10.0)
                .dailyForecasts(dailyForecasts)
                .weatherConflicts(conflicts)
                .build();
    }

    private String findOutdoorActivityForDate(Trip trip, String dateStr) {
        if (trip == null) return null;
        List<ItineraryDay> days = itineraryDayRepository.findByTripIdOrderByDayNumberAsc(trip.getId());
        for (ItineraryDay day : days) {
            if (day.getActivities() != null) {
                for (ItineraryActivity act : day.getActivities()) {
                    if (Boolean.TRUE.equals(act.getIsOutdoor())) {
                        return act.getTitle();
                    }
                }
            }
        }
        return null;
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
            default -> "Clear Skies";
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
            default -> "sun";
        };
    }

    private String mapOwmConditionToIcon(String condition) {
        if (condition == null) return "sun";
        String lower = condition.toLowerCase();
        if (lower.contains("rain") || lower.contains("drizzle")) return "cloud-rain";
        if (lower.contains("cloud")) return "cloud-sun";
        if (lower.contains("thunder")) return "cloud-lightning";
        if (lower.contains("snow")) return "snowflake";
        return "sun";
    }

    private WeatherForecastResponse buildFallbackForecast(String destination, Trip trip) {
        List<WeatherForecastResponse.DailyForecastDto> forecasts = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 0; i < 7; i++) {
            forecasts.add(WeatherForecastResponse.DailyForecastDto.builder()
                    .date(now.plusDays(i).toString())
                    .tempMax(28.0)
                    .tempMin(21.0)
                    .condition("Pleasant & Clear")
                    .rainProbability(15)
                    .icon("sun")
                    .build());
        }

        return WeatherForecastResponse.builder()
                .destination(destination)
                .currentTemperature(26.5)
                .currentCondition("Clear")
                .rainProbability(15)
                .windSpeed(11.0)
                .dailyForecasts(forecasts)
                .weatherConflicts(new ArrayList<>())
                .build();
    }

    public boolean isExternalApiConfigured() {
        return weatherApiKey != null && !weatherApiKey.equals("NO_KEY") && !weatherApiKey.isBlank();
    }
}
