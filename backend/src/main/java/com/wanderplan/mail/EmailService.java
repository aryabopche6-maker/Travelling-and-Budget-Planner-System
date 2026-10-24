package com.wanderplan.mail;

import com.wanderplan.invitation.TripInvitation;
import com.wanderplan.trip.Trip;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String mailUsername;

    @Value("${spring.mail.password:${MAIL_PASSWORD:}}")
    private String mailPassword;

    @Value("${app.frontend.url:https://travelling-and-budget-planner-syste.vercel.app}")
    private String frontendUrl;

    // Google Apps Script web app URL for HTTPS email fallback (set via env var or Render config)
    @Value("${EMAIL_WEBHOOK_URL:}")
    private String emailWebhookUrl;

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

        String subject = "You're Invited! Join " + inviterName + " on a trip to " + destination;
        String htmlBody = buildHtmlEmailContent(inviterName, destination, datesStr, acceptUrl, declineUrl);

        boolean sent = false;
        if (mailUsername != null && !mailUsername.isBlank() && mailPassword != null && !mailPassword.isBlank()) {
            log.info("Sending invitation email to {} using configured SMTP", toEmail);
            sent = trySendViaPort(465, true, mailUsername, mailPassword, toEmail, subject, htmlBody);
            if (!sent) {
                log.warn("Port 465 SSL failed, trying port 587 TLS...");
                sent = trySendViaPort(587, false, mailUsername, mailPassword, toEmail, subject, htmlBody);
            }
        } else {
            log.warn("SMTP credentials are not configured; trying the email webhook fallback.");
        }

        // Strategy 2: If SMTP fails (cloud ports blocked), use Google Apps Script HTTPS webhook
        if (!sent) {
            log.warn("All SMTP ports failed (likely blocked by cloud host). Trying HTTPS webhook fallback...");
            sent = trySendViaWebhook(toEmail, subject, htmlBody);
        }

        if (sent) {
            log.info("Invitation email sent successfully to {} for invitation {}", toEmail, invitation.getId());
        } else {
            log.error("All email methods failed for invitation {} to {}", invitation.getId(), toEmail);
        }
        return sent;
    }

    /**
     * Send email via Google Apps Script HTTPS webhook.
     * This bypasses SMTP port restrictions on cloud platforms like Render.
     * Uses standard HTTPS (port 443) which is NEVER blocked.
     */
    private boolean trySendViaWebhook(String toEmail, String subject, String htmlBody) {
        // Check for webhook URL from env var or @Value
        String webhookUrl = (emailWebhookUrl != null && !emailWebhookUrl.isBlank()) 
                ? emailWebhookUrl 
                : System.getenv("EMAIL_WEBHOOK_URL");

        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.error("No EMAIL_WEBHOOK_URL configured. Cannot send via HTTPS webhook.");
            return false;
        }

        try {
            // Build JSON payload
            String jsonPayload = String.format(
                "{\"to\":\"%s\",\"subject\":\"%s\",\"htmlBody\":\"%s\"}",
                escapeJson(toEmail),
                escapeJson(subject),
                escapeJson(htmlBody)
            );

            log.info("Sending email via HTTPS webhook to: {}", toEmail);

            URL url = new URL(webhookUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            // Follow redirects (Apps Script returns 302 redirect)
            conn.setInstanceFollowRedirects(false);

            // Write the payload
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            int responseCode = conn.getResponseCode();

            // Google Apps Script returns 302 redirect - the redirect target must be fetched with GET
            if (responseCode == 302 || responseCode == 301) {
                String redirectUrl = conn.getHeaderField("Location");
                if (redirectUrl != null) {
                    log.info("Following Apps Script redirect via GET...");
                    conn.disconnect();
                    URL rUrl = new URL(redirectUrl);
                    HttpURLConnection rConn = (HttpURLConnection) rUrl.openConnection();
                    rConn.setRequestMethod("GET");
                    rConn.setConnectTimeout(15000);
                    rConn.setReadTimeout(15000);

                    responseCode = rConn.getResponseCode();
                    String responseBody = new String(
                        (responseCode >= 200 && responseCode < 400) 
                            ? rConn.getInputStream().readAllBytes() 
                            : rConn.getErrorStream().readAllBytes(),
                        StandardCharsets.UTF_8
                    );
                    rConn.disconnect();
                    log.info("Webhook redirect response: {} - {}", responseCode, responseBody);
                    return responseBody.contains("\"status\":\"success\"") || responseBody.contains("\"success\":true") || responseCode == 200;
                }
            }

            String responseBody = new String(
                (responseCode >= 200 && responseCode < 400) 
                    ? conn.getInputStream().readAllBytes() 
                    : conn.getErrorStream().readAllBytes(),
                StandardCharsets.UTF_8
            );
            conn.disconnect();

            log.info("Webhook response: {} - {}", responseCode, responseBody);
            return responseBody.contains("\"success\":true") || responseCode == 200;

        } catch (Exception e) {
            log.error("HTTPS webhook email sending failed: {}", e.getMessage());
            return false;
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private boolean trySendViaPort(int port, boolean ssl, String username, String password, String toEmail, 
                                   String subject, String htmlBody) {
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
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

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
