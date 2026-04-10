package com.formcraft.service.impl;

import com.formcraft.entity.AuditLog;
import com.formcraft.repository.AuditLogRepository;
import com.formcraft.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AuditService self;

    private AuditServiceImpl auditService;

    @BeforeEach
    void setUp() {
        auditService = new AuditServiceImpl(auditLogRepository, self);
    }

    @Test
    void log_WithExplicitActor_ShouldSaveAuditLog() {
        // Arrange
        UUID entityId = UUID.randomUUID();
        
        // Act
        auditService.log("ACTION", "ACTOR", "ENTITY", entityId, "DETAILS");

        // Assert
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        
        AuditLog saved = captor.getValue();
        assertEquals("ACTION", saved.getAction());
        assertEquals("ACTOR", saved.getActor());
        assertEquals("ENTITY", saved.getEntityType());
        assertEquals(entityId, saved.getEntityId());
        assertEquals("DETAILS", saved.getDetails());
    }

    @Test
    void log_WithNullActor_ShouldDefaultToSystem() {
        // Act
        auditService.log("ACTION", null, "ENTITY", null, "DETAILS");

        // Assert
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        assertEquals("SYSTEM", captor.getValue().getActor());
    }

    @Test
    void log_ResolvedIdentity_ShouldCallRecursiveLogWithAuthName() {
        // Arrange
        SecurityContext context = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("auth_user");
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        UUID entityId = UUID.randomUUID();

        // Act
        auditService.log("ACTION", "ENTITY", entityId, "DETAILS");

        // Assert
        verify(self).log("ACTION", "auth_user", "ENTITY", entityId, "DETAILS");
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void log_ResolvedIdentity_ShouldCallRecursiveLogWithAnonymous_WhenNoAuth() {
        // Arrange
        SecurityContextHolder.clearContext();
        UUID entityId = UUID.randomUUID();

        // Act
        auditService.log("ACTION", "ENTITY", entityId, "DETAILS");

        // Assert
        verify(self).log("ACTION", "ANONYMOUS", "ENTITY", entityId, "DETAILS");
    }

    @Test
    void log_ShouldHandlePersistenceFailure_Gracefully() {
        // Arrange: Repository throws exception
        doThrow(new RuntimeException("DB Crash")).when(auditLogRepository).save(any());

        // Act & Assert: Should NOT throw exception (caught internally at line 41)
        auditService.log("ACTION", "ACTOR", "ENTITY", null, "DETAILS");
        
        verify(auditLogRepository).save(any());
    }
}
