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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AuditService self;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private AuditServiceImpl auditService;

    @BeforeEach
    void setUp() {
        auditService = new AuditServiceImpl(auditLogRepository, self);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void log_WithExplicitActor_ShouldSaveAuditLog() {
        UUID entityId = UUID.randomUUID();
        auditService.log("ACTION", "ACTOR", "TYPE", entityId, "DETAILS");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("ACTION", saved.getAction());
        assertEquals("ACTOR", saved.getActor());
        assertEquals("TYPE", saved.getEntityType());
        assertEquals(entityId, saved.getEntityId());
        assertEquals("DETAILS", saved.getDetails());
    }

    @Test
    void log_WithNullActor_ShouldDefaultToSystem() {
        auditService.log("ACTION", null, "TYPE", null, "DETAILS");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        assertEquals("SYSTEM", captor.getValue().getActor());
    }

    @Test
    void log_AutoResolvedActor_ShouldUseAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");

        UUID entityId = UUID.randomUUID();
        auditService.log("ACTION", "TYPE", entityId, "DETAILS");

        verify(self).log("ACTION", "testuser", "TYPE", entityId, "DETAILS");
    }

    @Test
    void log_AnonymousActor_ShouldFallbackWhenNoAuth() {
        when(securityContext.getAuthentication()).thenReturn(null);

        UUID entityId = UUID.randomUUID();
        auditService.log("ACTION", "TYPE", entityId, "DETAILS");

        verify(self).log("ACTION", "ANONYMOUS", "TYPE", entityId, "DETAILS");
    }

    @Test
    void log_HandlePersistenceError_ShouldNotPropagate() {
        // Force an error to hit the 'catch' block (Coverage hack)
        doThrow(new RuntimeException("DB Down")).when(auditLogRepository).save(any(AuditLog.class));

        // This should not throw an exception as the catch block swallows it with a log.error
        auditService.log("ACTION", "ACTOR", "TYPE", null, "DETAILS");

        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
