package com.formcraft.service;

public interface AuditService {
    /**
     * Standard audit log recording. 
     * Recommended for @Async methods where the main thread's SecurityContext is lost.
     */
    void log(String action, String actor, String entityType, java.util.UUID entityId, String details);
    
    /**
     * Convenience method — only use in synchronous (Main Thread) calls where 
     * SecurityContextHolder is accessible.
     */
    void log(String action, String entityType, java.util.UUID entityId, String details);
}
