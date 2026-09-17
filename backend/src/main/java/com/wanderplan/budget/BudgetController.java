package com.wanderplan.budget;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetResponse budget = budgetService.getTripBudget(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip budget retrieved", budget));
    }

    @PostMapping("/hidden-costs")
    public ResponseEntity<ApiResponse<HiddenCostResponse>> addHiddenCost(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody HiddenCostRequest request) {
        HiddenCostResponse hc = budgetService.addHiddenCost(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Hidden cost added", hc));
    }

    @DeleteMapping("/hidden-costs/{costId}")
    public ResponseEntity<ApiResponse<Void>> deleteHiddenCost(
            @PathVariable Long tripId,
            @PathVariable Long costId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        budgetService.deleteHiddenCost(tripId, costId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Hidden cost deleted"));
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<SimulationResponse>> simulateBudget(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SimulationRequest request) {
        SimulationResponse simulation = budgetService.simulateBudget(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Budget simulation computed", simulation));
    }

    @GetMapping("/alternatives")
    public ResponseEntity<ApiResponse<List<AlternativeResponse>>> getAlternatives(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AlternativeResponse> alternatives = budgetService.getAlternatives(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Smart alternatives retrieved", alternatives));
    }

    @GetMapping("/rescue")
    public ResponseEntity<ApiResponse<BudgetRescueResponse>> getBudgetRescue(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetRescueResponse rescue = budgetService.getBudgetRescue(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget rescue report generated", rescue));
    }
}
