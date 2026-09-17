package com.wanderplan.expense;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.exception.ResourceNotFoundException;
import com.wanderplan.member.TripMember;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripService tripService;

    @Transactional
    public ExpenseResponse addExpense(Long tripId, Long userId, ExpenseRequest request) {
        tripService.validateTripMembership(tripId, userId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        User payer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));

        Expense expense = Expense.builder()
                .trip(trip)
                .title(request.getTitle())
                .amount(request.getAmount())
                .paidBy(userId)
                .paidByName(payer.getName())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .category(request.getCategory() != null ? request.getCategory() : "Misc")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI")
                .splitType(request.getSplitType() != null ? request.getSplitType() : "EQUAL")
                .proofUrl(request.getProofUrl())
                .status("PENDING")
                .splits(new ArrayList<>())
                .build();

        expense = expenseRepository.save(expense);

        // Process splits
        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        if ("EQUAL".equalsIgnoreCase(request.getSplitType()) || request.getSplits() == null || request.getSplits().isEmpty()) {
            double splitAmount = request.getAmount() / Math.max(1, members.size());
            for (TripMember m : members) {
                ExpenseSplit split = ExpenseSplit.builder()
                        .expense(expense)
                        .userId(m.getUser().getId())
                        .userName(m.getUser().getName())
                        .amount(splitAmount)
                        .isPaid(m.getUser().getId().equals(userId))
                        .build();
                expense.getSplits().add(split);
            }
        } else {
            for (ExpenseSplitDto sDto : request.getSplits()) {
                ExpenseSplit split = ExpenseSplit.builder()
                        .expense(expense)
                        .userId(sDto.getUserId())
                        .userName(sDto.getUserName())
                        .amount(sDto.getAmount())
                        .isPaid(sDto.getUserId().equals(userId))
                        .build();
                expense.getSplits().add(split);
            }
        }

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    public List<ExpenseResponse> getTripExpenses(Long tripId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        return expenseRepository.findByTripId(tripId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse approveExpense(Long tripId, Long expenseId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setStatus("ACCEPTED");
        return mapToResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse disputeExpense(Long tripId, Long expenseId, Long userId, DisputeExpenseRequest request) {
        tripService.validateTripMembership(tripId, userId);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setStatus("DISPUTED");
        expense.setDisputeReason(request.getReason());
        return mapToResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse settleExpense(Long tripId, Long expenseId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setStatus("SETTLED");
        for (ExpenseSplit s : expense.getSplits()) {
            s.setIsPaid(true);
        }
        return mapToResponse(expenseRepository.save(expense));
    }

    public String storeProofFile(MultipartFile file) {
        // Validation: Size (Max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB.");
        }

        // Validation: Type (Image or PDF)
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.equals("application/pdf"))) {
            throw new BadRequestException("Only image or PDF files are allowed.");
        }

        try {
            // Generate safe filename
            String originalExt = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (originalExt == null) originalExt = "bin";
            String safeFileName = UUID.randomUUID().toString() + "." + originalExt;
            
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(safeFileName).normalize();
            if (!filePath.getParent().equals(uploadPath.toAbsolutePath().normalize()) && !filePath.getParent().equals(uploadPath.normalize())) {
                 throw new SecurityException("Cannot store file outside current directory.");
            }
            
            Files.copy(file.getInputStream(), filePath);
            
            // Abstract return: just the safe identifier, not the path. 
            // In future, this could be an S3 key.
            return safeFileName;
        } catch (IOException e) {
            throw new BadRequestException("Could not store proof file: " + e.getMessage());
        }
    }

    public Resource getProofFileResource(Long tripId, Long expenseId, Long userId) {
        tripService.validateTripMembership(tripId, userId);
        
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
                
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Expense does not belong to this trip");
        }
                
        String proofIdentifier = expense.getProofUrl();
        if (proofIdentifier == null || proofIdentifier.isBlank()) {
            throw new ResourceNotFoundException("No proof file associated with this expense");
        }

        try {
            Path filePath = Paths.get("uploads").resolve(proofIdentifier).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + proofIdentifier);
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Could not read file: " + e.getMessage());
        }
    }

    private ExpenseResponse mapToResponse(Expense e) {
        List<ExpenseSplitDto> splitDtos = e.getSplits().stream().map(s -> ExpenseSplitDto.builder()
                .userId(s.getUserId())
                .userName(s.getUserName())
                .amount(s.getAmount())
                .isPaid(s.getIsPaid())
                .build()).collect(Collectors.toList());

        return ExpenseResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .amount(e.getAmount())
                .paidBy(e.getPaidBy())
                .paidByName(e.getPaidByName())
                .date(e.getDate())
                .category(e.getCategory())
                .paymentMethod(e.getPaymentMethod())
                .splitType(e.getSplitType())
                .proofUrl(e.getProofUrl())
                .status(e.getStatus())
                .disputeReason(e.getDisputeReason())
                .splits(splitDtos)
                .createdAt(e.getCreatedAt())
                .build();
    }
}
