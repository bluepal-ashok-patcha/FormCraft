package com.formcraft.service.impl;

import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.service.AuditService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormResponseConsumerTest {

    @Mock
    private FormResponseRepository formResponseRepository;

    @Mock
    private FormRepository formRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private FormResponseConsumer formResponseConsumer;

    @Test
    void consumeSubmission_ShouldPersistSuccessfully() {
        // Arrange
        UUID formId = UUID.randomUUID();
        SubmissionRequest request = new SubmissionRequest();
        request.setFormId(formId);
        request.setResponses(Map.of("q1", "Answer"));

        Form form = new Form();
        form.setId(formId);
        form.setName("Test Form");

        FormResponse savedResponse = new FormResponse();
        savedResponse.setId(UUID.randomUUID());

        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        when(formResponseRepository.save(any(FormResponse.class))).thenReturn(savedResponse);

        // Act
        formResponseConsumer.consumeSubmission(request);

        // Assert
        verify(formResponseRepository).save(any(FormResponse.class));
        verify(auditService).log(eq("SUBMIT_RESPONSE_ASYNC"), eq("RESPONSE"), any(), anyString());
    }

    @Test
    void consumeSubmission_ShouldHandleFormNotFound() {
        // Arrange
        UUID formId = UUID.randomUUID();
        SubmissionRequest request = new SubmissionRequest();
        request.setFormId(formId);

        when(formRepository.findById(formId)).thenReturn(Optional.empty());

        // Act
        formResponseConsumer.consumeSubmission(request);

        // Assert
        verify(formResponseRepository, never()).save(any());
        verify(auditService, never()).log(any(), any(), any(), any());
    }
}
