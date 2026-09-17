package com.wanderplan.surpriseme;

import com.wanderplan.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/surprise-me")
public class SurpriseMeController {

    @Autowired
    private SurpriseMeService surpriseMeService;

    @PostMapping
    public ResponseEntity<ApiResponse<SurpriseMeResponse>> generateSurpriseTrip(
            @Valid @RequestBody SurpriseMeRequest request) {
        SurpriseMeResponse result = surpriseMeService.generateSurpriseTrip(request);
        return ResponseEntity.ok(ApiResponse.success("Surprise destination generated", result));
    }
}
