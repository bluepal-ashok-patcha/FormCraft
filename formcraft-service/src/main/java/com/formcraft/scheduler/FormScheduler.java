package com.formcraft.scheduler;

import com.formcraft.repository.FormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class FormScheduler {

    private final FormRepository formRepository;

    /**
     * Runs every minute to synchronize database 'active' status 
     * with scheduled start and expiration dates.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void syncFormStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        int deactivated = formRepository.deactivateExpiredForms(now);
        if (deactivated > 0) {
            log.info("AUTO-DEACTIVATION: {} forms transitioned to INACTIVE due to expiry.", deactivated);
        }

        int activated = formRepository.activateScheduledForms(now);
        if (activated > 0) {
            log.info("AUTO-ACTIVATION: {} forms transitioned to ACTIVE based on start schedule.", activated);
        }
    }
}
