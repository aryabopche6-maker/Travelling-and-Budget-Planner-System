package com.wanderplan.expense;

import com.wanderplan.common.ApiResponse;
import com.wanderplan.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ExpenseResponse> expenses = expenseService.getTripExpenses(tripId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip expenses retrieved", expenses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.addExpense(tripId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Expense added successfully", expense));
    }

    @PostMapping("/{expenseId}/approve")
    public ResponseEntity<ApiResponse<ExpenseResponse>> approveExpense(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ExpenseResponse expense = expenseService.approveExpense(tripId, expenseId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense approved", expense));
    }

    @PostMapping("/{expenseId}/dispute")
    public ResponseEntity<ApiResponse<ExpenseResponse>> disputeExpense(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DisputeExpenseRequest request) {
        ExpenseResponse expense = expenseService.disputeExpense(tripId, expenseId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Expense disputed", expense));
    }

    @PostMapping("/{expenseId}/settle")
    public ResponseEntity<ApiResponse<ExpenseResponse>> settleExpense(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ExpenseResponse expense = expenseService.settleExpense(tripId, expenseId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense settled", expense));
    }

    @PostMapping("/upload-proof")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProof(
            @RequestParam("file") MultipartFile file) {
        String proofUrl = expenseService.storeProofFile(file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded", Map.of("proofUrl", proofUrl)));
    }

    @GetMapping("/{expenseId}/proof-file")
    public ResponseEntity<Resource> downloadProof(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Resource resource = expenseService.getProofFileResource(tripId, expenseId, userPrincipal.getId());
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (Exception e) {
            // ignore
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
