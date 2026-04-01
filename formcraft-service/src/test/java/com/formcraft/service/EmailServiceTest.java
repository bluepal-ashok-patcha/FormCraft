package com.formcraft.service;

import com.formcraft.exception.CommunicationException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void sendEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail("test@example.com", "Subject", "Body");

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(mimeMessage);
    }

    @Test
    void sendEmail_Failure_ThrowsCommunicationException() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new org.springframework.mail.MailSendException("SMTP Error")).when(mailSender).send(any(MimeMessage.class));

        assertThrows(CommunicationException.class, () -> 
            emailService.sendEmail("test@example.com", "Subject", "Body")
        );
    }

    @Test
    void sendVerificationEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendVerificationEmail("test@example.com", "123456");
        
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendForgotPasswordEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendForgotPasswordEmail("test@example.com", "123456");
        
        verify(mailSender).send(any(MimeMessage.class));
    }
}
