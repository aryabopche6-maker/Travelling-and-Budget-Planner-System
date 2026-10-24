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
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private Environment environment;

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String mailUsername;

    @Value("${spring.mail.password:${MAIL_PASSWORD:}}")
    private String mailPassword;

    @Value("${app.frontend.url:https://travelling-and-budget-planner-syste.vercel.app}")
    private String frontendUrl;

    public boolean sendTripInvitationEmail(TripInvitation invitation) {
        Trip trip = invitation.getTrip();
        String toEmail = invitation.getInvitedEmail();
        String inviterName = invitation.getInvitedBy() != null ? invitation.getInvitedBy().getName() : "A friend";
        String destination = trip != null ? trip.getDestination() : "Trip Adventure";

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String datesStr = (trip != null && trip.getStartDate() != null && trip.getEndDate() != null)
                ? trip.getStartDate().format(dtf) + " to " + trip.getEndDate().format(dtf)
                : "Upcoming Dates";

        String acceptUrl = frontendUrl.replaceAll("/+$", "") + "/invitations/accept?token=" + invitation.getToken();
        String declineUrl = frontendUrl.replaceAll("/+$", "") + "/invitations/decline?token=" + invitation.getToken();

        String effectiveUsername = (mailUsername != null && !mailUsername.isBlank()) 
                ? mailUsername 
                : (System.getenv("MAIL_USERNAME") != null && !System.getenv("MAIL_USERNAME").isBlank() 
                    ? System.getenv("MAIL_USERNAME") 
                    : "aryabopche6@gmail.com");

        String effectivePassword = (mailPassword != null && !mailPassword.isBlank()) 
                ? mailPassword 
                : (System.getenv("MAIL_PASSWORD") != null && !System.getenv("MAIL_PASSWORD").isBlank() 
                    ? System.getenv("MAIL_PASSWORD") 
                    : "xywkkpaedvrielbf");

        log.info("Sending invitation email using sender username: {}", effectiveUsername);

        // Try sending with Port 465 SSL first, if fails try Port 587 TLS
        boolean sent = trySendViaPort(465, true, effectiveUsername, effectivePassword, toEmail, inviterName, destination, datesStr, acceptUrl, declineUrl);
        if (!sent) {
            log.warn("Port 465 SSL failed, trying port 587 TLS as fallback...");
            sent = trySendViaPort(587, false, effectiveUsername, effectivePassword, toEmail, inviterName, destination, datesStr, acceptUrl, declineUrl);
        }

        if (sent) {
            log.info("Invitation email sent successfully to {} for invitation {}", toEmail, invitation.getId());
        } else {
            log.error("All SMTP attempts failed for invitation {}", invitation.getId());
        }
        return sent;
    }

    private boolean trySendViaPort(int port, boolean ssl, String username, String password, String toEmail, 
                                   String inviterName, String destination, String datesStr, String acceptUrl, String declineUrl) {
        try {
            org.springframework.mail.javamail.JavaMailSenderImpl directSender = new org.springframework.mail.javamail.JavaMailSenderImpl();
            directSender.setHost("smtp.gmail.com");
            directSender.setPort(port);
            directSender.setUsername(username.trim());
            directSender.setPassword(password.trim().replaceAll("\\s+", ""));

            java.util.Properties props = directSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            if (ssl) {
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            } else {
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            }
            props.put("mail.smtp.connectiontimeout", "8000");
            props.put("mail.smtp.timeout", "8000");
            props.put("mail.smtp.writetimeout", "8000");

            MimeMessage message = directSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(username.trim(), "WanderPlan Travel Planner");
            helper.setTo(toEmail);
            helper.setSubject("You're Invited! Join " + inviterName + " on a trip to " + destination);
            helper.setText(buildHtmlEmailContent(inviterName, destination, datesStr, acceptUrl, declineUrl), true);

            directSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("SMTP sending failed on port {} (ssl={}): {}", port, ssl, e.getMessage());
            return false;
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

}
