package com.formcraft.service;

import com.formcraft.exception.CommunicationException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void sendVerificationEmail_ShouldCallSend() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendVerificationEmail("test@example.com", "123456");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendForgotPasswordEmail_ShouldCallSend() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendForgotPasswordEmail("test@example.com", "123456");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendEmail_ShouldThrowCommunicationException_OnMessagingError() {
        when(mailSender.createMimeMessage()).thenThrow(new MailSendException("SMTP Down"));

        assertThrows(CommunicationException.class, () -> 
            emailService.sendEmail("to@test.com", "Sub", "Body"));
    }

    @Test
    void sendEmail_ShouldThrowCommunicationException_OnMailException() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("Fail")).when(mailSender).send(any(MimeMessage.class));

        assertThrows(CommunicationException.class, () -> 
            emailService.sendEmail("to@test.com", "Sub", "Body"));
    }
}
