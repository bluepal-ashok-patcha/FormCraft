package com.formcraft.service.impl;

import com.formcraft.entity.AuditLog;
import com.formcraft.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AuditServiceImpl self;

    @InjectMocks
    private AuditServiceImpl auditService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(auditService, "self", auditService); // Point self to actual instance for test
    }

    @Test
    void log_WithActor_ShouldSaveAuditLog() {
        // Arrange
        UUID entityId = UUID.randomUUID();
        String action = "CREATE";
        String actor = "testuser";
        String entityType = "FORM";
        String details = "New form created";

        // Act
        auditService.log(action, actor, entityType, entityId, details);

        // Assert
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        
        AuditLog saved = captor.getValue();
        assertEquals(action, saved.getAction());
        assertEquals(actor, saved.getActor());
        assertEquals(entityType, saved.getEntityType());
        assertEquals(entityId, saved.getEntityId());
        assertEquals(details, saved.getDetails());
    }

    @Test
    void log_WithoutActor_ShouldResolveFromContext() {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("contextuser");
        
        SecurityContextHolder.setContext(securityContext);
        
        UUID entityId = UUID.randomUUID();

        // Act
        auditService.log("LOGIN", "USER", entityId, "Log in");

        // Assert
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        assertEquals("contextuser", captor.getValue().getActor());
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void log_ShouldHandleException() {
        // Arrange
        when(auditLogRepository.save(any())).thenThrow(new RuntimeException("DB Error"));

        // Act & Assert
        // Should not throw exception to the caller due to try-catch in service
        assertDoesNotThrow(() -> auditService.log("ACTION", "ACTOR", "TYPE", UUID.randomUUID(), "DETAILS"));
    }
}
