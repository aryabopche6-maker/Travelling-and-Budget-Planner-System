package com.wanderplan.expense;

import com.wanderplan.exception.BadRequestException;
import com.wanderplan.member.TripMember;
import com.wanderplan.member.TripMemberRepository;
import com.wanderplan.notification.NotificationService;
import com.wanderplan.trip.Trip;
import com.wanderplan.trip.TripRepository;
import com.wanderplan.trip.TripService;
import com.wanderplan.user.User;
import com.wanderplan.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock private ExpenseRepository expenseRepository;
    @Mock private TripRepository tripRepository;
    @Mock private TripMemberRepository tripMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private TripService tripService;
    @Mock private NotificationService notificationService;

    @InjectMocks private ExpenseService expenseService;

    @Test
    void equalSplitMarksActualPayerAsPaid() {
        Trip trip = Trip.builder().id(9L).destination("Rome").build();
        User creator = User.builder().id(1L).name("Creator").build();
        User payer = User.builder().id(2L).name("Payer").build();
        when(tripRepository.findById(9L)).thenReturn(Optional.of(trip));
        when(tripMemberRepository.findByTripId(9L)).thenReturn(List.of(
                TripMember.builder().trip(trip).user(creator).isTripAdmin(true).status("ACCEPTED").build(),
                TripMember.builder().trip(trip).user(payer).isTripAdmin(false).status("ACCEPTED").build()));
        when(tripMemberRepository.existsByTripIdAndUserId(9L, 2L)).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(payer));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseRequest request = new ExpenseRequest();
        request.setTitle("Train");
        request.setAmount(100.0);
        request.setPaidBy(2L);
        request.setSplitType("EQUAL");

        ExpenseResponse response = expenseService.addExpense(9L, 1L, request);

        assertTrue(response.getSplits().stream().filter(split -> split.getUserId().equals(2L))
                .findFirst().orElseThrow().getIsPaid());
        assertFalse(response.getSplits().stream().filter(split -> split.getUserId().equals(1L))
                .findFirst().orElseThrow().getIsPaid());
    }

    @Test
    void customSplitMustReconcileWithExpenseAmount() {
        Trip trip = Trip.builder().id(9L).destination("Rome").build();
        User payer = User.builder().id(2L).name("Payer").build();
        when(tripRepository.findById(9L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(2L)).thenReturn(Optional.of(payer));
        when(tripMemberRepository.findByTripId(9L)).thenReturn(List.of(
                TripMember.builder().trip(trip).user(payer).isTripAdmin(true).status("ACCEPTED").build()));
        when(tripMemberRepository.existsByTripIdAndUserId(9L, 2L)).thenReturn(true);

        ExpenseRequest request = new ExpenseRequest();
        request.setTitle("Train");
        request.setAmount(100.0);
        request.setSplitType("CUSTOM");
        request.setSplits(List.of(new ExpenseSplitDto(2L, "Payer", 90.0, true)));

        assertThrows(BadRequestException.class, () -> expenseService.addExpense(9L, 2L, request));
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void paymentReminderCreatesNotificationForOutstandingMemberShare() {
        Trip trip = Trip.builder().id(9L).destination("Rome").build();
        Expense expense = Expense.builder()
                .trip(trip)
                .paidBy(1L)
                .status("PENDING")
                .splits(List.of(
                        ExpenseSplit.builder().userId(1L).amount(40.25).isPaid(true).build(),
                        ExpenseSplit.builder().userId(2L).amount(40.25).isPaid(false).build()))
                .build();
        when(expenseRepository.findByTripId(9L)).thenReturn(List.of(expense));

        double amount = expenseService.sendPaymentReminder(9L, 2L, 1L);

        assertEquals(40.25, amount);
        verify(tripService).validateTripMembership(9L, 1L);
        verify(tripService).validateTripMembership(9L, 2L);
        verify(notificationService).createNotification(
                eq(2L), eq("Payment reminder"), contains("₹40.25"), eq("EXPENSE"));
    }

    @Test
    void paymentReminderRequiresAnOutstandingShare() {
        Expense expense = Expense.builder()
                .paidBy(1L)
                .status("SETTLED")
                .splits(List.of(ExpenseSplit.builder().userId(2L).amount(40.0).isPaid(false).build()))
                .build();
        when(expenseRepository.findByTripId(9L)).thenReturn(List.of(expense));

        assertThrows(BadRequestException.class, () -> expenseService.sendPaymentReminder(9L, 2L, 1L));
        verify(notificationService, never()).createNotification(anyLong(), anyString(), anyString(), anyString());
    }
}
