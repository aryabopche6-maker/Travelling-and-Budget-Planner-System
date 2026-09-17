package com.wanderplan.weather;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeather(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WeatherForecastResponse forecast = weatherService.getWeatherForTrip(tripId, userPrincipal.getId());
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("weather", forecast);
        responseData.put("isExternalConfigured", weatherService.isExternalApiConfigured());

        return ResponseEntity.ok(ApiResponse.success("Weather forecast retrieved", responseData));
    }
}
