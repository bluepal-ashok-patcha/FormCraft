package com.formcraft.service.impl;

import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormResponseConsumer {

    private final FormResponseRepository formResponseRepository;
    private final FormRepository formRepository;
    private final AuditService auditService;

    @Transactional
    @KafkaListener(topics = "${app.kafka.topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeSubmission(SubmissionRequest request) {
        log.debug("Event Received: Processing submission for form ID '{}'", request.getFormId());

        try {
            Form form = formRepository.findById(request.getFormId())
                    .orElseThrow(() -> new ResourceNotFoundException("Form not found for submission processing: " + request.getFormId()));

            FormResponse response = FormResponse.builder()
                    .form(form)
                    .responseData(request.getResponses())
                    .build();

            FormResponse savedResponse = formResponseRepository.save(response);
            
            // Audit pulse: Recording the successful persistence from the event stream
            auditService.log("SUBMIT_RESPONSE_ASYNC", "RESPONSE", savedResponse.getId(), 
                "Response indexed via event-stream for form: " + form.getName());
            
            log.info("Persistence Complete: Submission for form '{}' synchronized to database.", form.getName());
            
        } catch (Exception e) {
            log.error("Persistence Failure: Could not process submission event for form ID '{}'. Error: {}", 
                request.getFormId(), e.getMessage());
            // In a production scenario, we might push this to a Dead Letter Topic (DLT)
        }
    }
}
