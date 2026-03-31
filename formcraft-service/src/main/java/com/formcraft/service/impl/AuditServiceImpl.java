package com.formcraft.service.impl;

import com.formcraft.entity.AuditLog;
import com.formcraft.repository.AuditLogRepository;
import com.formcraft.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Override
    public void log(String action, String actor, String entityType, UUID entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .actor(actor != null ? actor : "SYSTEM")
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.trace("Audit Log Persistent Record: {} action by {} on {} ({})", action, actor, entityType, entityId);
        } catch (Exception e) {
            log.error("Audit Protocol Breach: Failed to persist record for {} by {}. Error: {}", action, actor, e.getMessage());
        }
    }

    @Async
    @Override
    public void log(String action, String entityType, UUID entityId, String details) {
        String actor = "ANONYMOUS";
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                actor = auth.getName();
            }
        } catch (Exception e) {
            // Context might not be available in async thread if not specifically handled
            log.trace("Could not resolve security actor for audit in async context");
        }
        
        this.log(action, actor, entityType, entityId, details);
    }
}
