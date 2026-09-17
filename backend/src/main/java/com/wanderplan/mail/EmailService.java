package com.wanderplan.mail;

import com.wanderplan.invitation.TripInvitation;
import com.wanderplan.trip.Trip;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private Environment environment;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendTripInvitationEmail(TripInvitation invitation) {
        Trip trip = invitation.getTrip();
        String toEmail = invitation.getInvitedEmail();
        String inviterName = invitation.getInvitedBy() != null ? invitation.getInvitedBy().getName() : "A friend";
        String destination = trip != null ? trip.getDestination() : "Trip Adventure";

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String datesStr = (trip != null && trip.getStartDate() != null && trip.getEndDate() != null)
                ? trip.getStartDate().format(dtf) + " to " + trip.getEndDate().format(dtf)
                : "Upcoming Dates";

        String acceptUrl = frontendUrl + "/invitations/accept?token=" + invitation.getToken();
        String declineUrl = frontendUrl + "/invitations/decline?token=" + invitation.getToken();

        // Security Rule 1: Log tokens and URLs ONLY in non-production development environments
        if (isDevelopmentEnvironment()) {
            log.info("📧 [DEV ONLY] Trip invitation generated for {}: Accept URL -> {}, Decline URL -> {}",
                    toEmail, acceptUrl, declineUrl);
        } else {
            log.info("📧 Trip invitation dispatched to recipient");
        }

        // Send real SMTP email if mail credentials are configured
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(mailUsername, "WanderPlan Travel Planner");
                helper.setTo(toEmail);
                helper.setSubject("✈️ You're Invited! Join " + inviterName + " on a trip to " + destination);
                helper.setText(buildHtmlEmailContent(inviterName, destination, datesStr, acceptUrl, declineUrl), true);

                mailSender.send(message);
                log.info("✅ Live invitation email successfully sent via SMTP to {}", toEmail);
            } catch (Exception e) {
                log.error("Failed to deliver SMTP invitation email to {}: {}", toEmail, e.getMessage());
            }
        } else {
            log.info("ℹ️ SMTP credentials (MAIL_USERNAME) not configured. Email logged to dev console; invitation saved with token in database.");
        }
    }

    private String buildHtmlEmailContent(String inviterName, String destination, String datesStr, String acceptUrl, String declineUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<style>");
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #1e293b; }");
        sb.append(".card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }");
        sb.append(".header { background: linear-gradient(135deg, #19b5a5 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }");
        sb.append(".header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 700; }");
        sb.append(".content { padding: 32px 28px; }");
        sb.append(".trip-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }");
        sb.append(".btn-accept { display: inline-block; background-color: #19b5a5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-right: 12px; }");
        sb.append(".btn-decline { display: inline-block; background-color: #f1f5f9; color: #64748b !important; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; border: 1px solid #cbd5e1; }");
        sb.append(".footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }");
        sb.append("</style></head><body>");
        sb.append("<div class='card'>");
        sb.append("<div class='header'><h1>WanderPlan Invitation</h1><p>Travel and Budget Planning Made Simple</p></div>");
        sb.append("<div class='content'>");
        sb.append("<p style='font-size: 16px;'>Hi there! <strong>").append(inviterName).append("</strong> has invited you to join a trip on WanderPlan.</p>");
        sb.append("<div class='trip-box'>");
        sb.append("<div style='font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px;'>📍 ").append(destination).append("</div>");
        sb.append("<div style='font-size: 14px; color: #64748b;'>📅 <strong>Dates:</strong> ").append(datesStr).append("</div>");
        sb.append("</div>");
        sb.append("<p style='font-size: 14px; color: #64748b;'>Collaborate on budgets, vote on activities, split expenses fairly with SplitSmart, and explore real-time weather forecasts.</p>");
        sb.append("<div style='text-align: center; margin: 30px 0;'>");
        sb.append("<a href='").append(acceptUrl).append("' class='btn-accept'>Accept Invitation</a> ");
        sb.append("<a href='").append(declineUrl).append("' class='btn-decline'>Decline</a>");
        sb.append("</div>");
        sb.append("<p style='font-size: 12px; color: #94a3b8; text-align: center;'>This invitation link will expire in 7 days.</p>");
        sb.append("</div>");
        sb.append("<div class='footer'>© WanderPlan • Real Full-Stack College Project</div>");
        sb.append("</div></body></html>");
        return sb.toString();
    }

    private boolean isDevelopmentEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles.length == 0) return true; // Default profile is development
        return Arrays.stream(activeProfiles).noneMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
    }
}
