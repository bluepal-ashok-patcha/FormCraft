package com.formcraft.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("FormCraft Security <noreply@formcraft.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Communication Failure: Could not deliver identity payload pulse.", e);
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "FormCraft: Identity Verification Pulse [" + otp + "]";
        String body = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                "<body style='margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f7fa;'>" +
                "<div style='padding: 40px 20px;'>" +
                "<div style='max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f7;'>" +
                "<div style='padding: 40px; text-align: center;'>" +
                "  <div style='display: inline-block; width: 44px; height: 44px; background: #6366f1; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);'></div>" +
                "  <h1 style='margin: 0; color: #1e293b; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;'>Identity Key Pulse</h1>" +
                "  <p style='margin-top: 16px; color: #64748b; font-size: 15px; line-height: 24px;'>To authorize your secure link with FormCraft, deploy the identification signal below.</p>" +
                "  " +
                "  <div style='margin: 32px 0; padding: 24px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;'>" +
                "    <div style='color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;'>Authorization Code</div>" +
                "    <div style='color: #6366f1; font-size: 48px; font-weight: 800; letter-spacing: 12px; line-height: 1;'>" + otp + "</div>" +
                "  </div>" +
                "  " +
                "  <div style='font-size: 13px; color: #94a3b8; line-height: 20px;'>" +
                "    Link valid for <span style='color: #ef4444; font-weight: 600;'>5 minutes</span>.<br>" +
                "    If you did not initiate this pulse, secure your perimeter." +
                "  </div>" +
                "</div>" +
                "<div style='padding: 20px; background: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;'>" +
                "  <span style='font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;'>FormCraft Security Operations // Verified Entry</span>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
        sendEmail(to, subject, body);
    }
}
