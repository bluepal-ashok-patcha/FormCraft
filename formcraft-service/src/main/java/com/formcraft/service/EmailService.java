package com.formcraft.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.formcraft.exception.CommunicationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("FormCraft <noreply@formcraft.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("SMTP Communication Failure: {}", e.getMessage(), e);
            throw new CommunicationException("Communication Failure: Could not deliver identity payload pulse.");
        }
    }

    public void sendVerificationEmail(String to, String otp) {
        String verificationUrl = frontendUrl + "/register?email=" + to + "&otp=" + otp;
        String subject = "Welcome to FormCraft: Action Required Pulse [" + otp + "]";
        String body = generateEmailTemplate("Welcome to the Ecosystem", 
            "We're thrilled to have you join our digital architecture community. To finalize your node in the network and start building intelligent forms, please deploy the identification signal below or click the direct pulse link.",
            otp, verificationUrl, "Verify & Log In");
        sendEmail(to, subject, body);
    }

    public void sendForgotPasswordEmail(String to, String otp) {
        String resetUrl = frontendUrl + "/forgot-password?identity=" + to + "&otp=" + otp;
        String subject = "Security Access Refusal: Reset Requested [" + otp + "]";
        String body = generateEmailTemplate("Identity Access Request", 
            "A security sequence has been initiated for your FormCraft account. To redefine your access credentials, please deploy the authorization code below or follow the direct reset link. If you did not initiate this pulse, someone else may be attempting to access your perimeter.",
            otp, resetUrl, "Reset Password");
        sendEmail(to, subject, body);
    }

    private String generateEmailTemplate(String title, String message, String otp, String actionUrl, String buttonText) {
        return "<!DOCTYPE html>" +
                "<html><head>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' rel='stylesheet'>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: \"Inter\", -apple-system, sans-serif; background-color: #ffffff; color: #334155;'>" +
                "  <div style='max-width: 520px; margin: 40px auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px;'>" +
                "    <div style='display: flex; align-items: center; margin-bottom: 40px;'>" +
                "      <svg width='36' height='36' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' style='margin-right: 12px;'>" +
                "        <rect width='40' height='40' rx='10' fill='#4f46e5'/>" +
                "        <path d='M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z' stroke='white' stroke-width='2.5'/>" +
                "        <path d='M16 18H24' stroke='white' stroke-width='2.5' stroke-linecap='round'/>" +
                "        <path d='M16 22H21' stroke='white' stroke-width='2.5' stroke-linecap='round'/>" +
                "      </svg>" +
                "      <span style='font-weight: 700; font-size: 20px; letter-spacing: -0.04em; color: #0f172a;'>FormCraft</span>" +
                "    </div>" +
                "    <h1 style='font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.02em;'>" + title + "</h1>" +
                "    <p style='font-size: 15px; line-height: 1.6; color: #64748b; margin-bottom: 32px;'>" + message + "</p>" +
                "    " +
                "    <div style='margin-bottom: 32px; background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; border: 1px dashed #cbd5e1;'>" +
                "      <p style='margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;'>Your Authorization Code</p>" +
                "      <p style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; font-family: monospace;'>" + otp + "</p>" +
                "    </div>" +
                "    " +
                "    <a href='" + actionUrl + "' style='display: block; width: 100%; box-sizing: border-box; text-align: center; background: #0f172a; color: #ffffff; padding: 14px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 14px; margin-bottom: 32px;'>" + buttonText + "</a>" +
                "    " +
                "    <div style='border-top: 1px solid #f1f5f9; padding-top: 24px; font-size: 13px; color: #94a3b8; line-height: 1.5;'>" +
                "      This link and code will expire in <span style='font-weight: 600; color: #ef4444;'>5 minutes</span>. " +
                "      If you did not request this, please ignore this email or contact support." +
                "    </div>" +
                "    " +
                "    <div style='margin-top: 40px; font-size: 11px; color: #cbd5e1; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;'>" +
                "      &copy; " + java.time.Year.now().getValue() + " FormCraft Intelligence Operations" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
