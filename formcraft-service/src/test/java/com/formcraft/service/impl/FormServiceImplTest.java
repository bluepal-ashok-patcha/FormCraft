package com.formcraft.service.impl;
 
import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.dto.response.FormDto;
import com.formcraft.entity.Form;
import com.formcraft.enums.FormStatus;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.service.GeminiService;
import com.formcraft.service.TemplateService;
import com.formcraft.mapper.FormMapper;
import com.formcraft.mapper.ResponseMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
 
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
 
@ExtendWith(MockitoExtension.class)
class FormServiceImplTest {
 
    @Mock
    private FormRepository formRepository;
 
    @Mock
    private FormResponseRepository formResponseRepository;
 
    @Mock
    private TemplateRepository templateRepository;
 
    @Mock
    private FormMapper formMapper;
 
    @Mock
    private ResponseMapper responseMapper;
 
    @Mock
    private GeminiService geminiService;
 
    @Mock
    private TemplateService templateService;
    
    @Mock
    private SecurityContext securityContext;
    
    @Mock
    private Authentication authentication;
    
    @Mock
    private com.formcraft.service.AuditService auditService;
 
    @Mock
    private com.formcraft.repository.builder.FormDraftRepository formDraftRepository;

    @Mock
    private com.formcraft.util.FormValidator formValidator;

    @InjectMocks
    private FormServiceImpl formService;
 
    private Form form;
    private FormRequest formRequest;
    private FormDto formDto;
    private UUID formId;
 
    @BeforeEach
    void setUp() {
        formId = UUID.randomUUID();
        
        formRequest = new FormRequest();
        formRequest.setName("Audit Form");
        formRequest.setSchema(new HashMap<>());
        
        java.util.Map<String, Object> schema = new HashMap<>();
        schema.put("fields", new java.util.ArrayList<java.util.Map<String, Object>>());

        form = Form.builder()
                .id(formId)
                .name("Audit Form")
                .status(FormStatus.ACTIVE)
                .slug("audit-form")
                .schema(schema)
                .build();
        
        // Identity Registry Protocol: Manual injection of audit telemetry
        form.setCreatedBy("testuser");
        form.setCreatedAt(LocalDateTime.now());
 
        formDto = FormDto.builder()
                .id(formId)
                .name("Audit Form")
                .build();
                
        SecurityContextHolder.setContext(securityContext);
    }
 
    @Test
    void createForm_Success() {
        when(formMapper.toEntity(any(FormRequest.class))).thenReturn(form);
        when(formRepository.save(any(Form.class))).thenReturn(form);
        when(formMapper.toDto(any(Form.class))).thenReturn(formDto);
 
        FormDto result = formService.createForm(formRequest);
 
        assertNotNull(result);
        assertEquals("Audit Form", result.getName());
        verify(formRepository, times(1)).save(any(Form.class));
    }
 
    @Test
    void submitResponse_FormNotFound_ThrowsResourceNotFoundException() {
        SubmissionRequest request = new SubmissionRequest();
        request.setFormId(UUID.randomUUID());
        when(formRepository.findById(any(UUID.class))).thenReturn(Optional.empty());
 
        assertThrows(ResourceNotFoundException.class, () -> {
            formService.submitResponse(request);
        });
    }
 
    @Test
    void submitResponse_FormInactive_ThrowsBusinessLogicException() {
        form.setStatus(FormStatus.INACTIVE);
        when(formRepository.findById(any(UUID.class))).thenReturn(Optional.of(form));
        SubmissionRequest request = new SubmissionRequest();
        request.setFormId(formId);
 
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            formService.submitResponse(request);
        });
 
        assertTrue(exception.getMessage().contains("currently not active"));
    }
    
    @Test
    void getFormBySlug_Success() {
        when(formRepository.findBySlug("audit-form")).thenReturn(Optional.of(form));
        when(formMapper.toDto(any(Form.class))).thenReturn(formDto);
        
        FormDto result = formService.getFormBySlug("audit-form");
        
        assertEquals("Audit Form", result.getName());
        assertEquals(formId, result.getId());
    }

    @Test
    void toggleFormStatus_Success() {
        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        when(formRepository.save(any(Form.class))).thenReturn(form);
        when(formMapper.toDto(any(Form.class))).thenReturn(formDto);

        FormDto result = formService.toggleFormStatus(formId);

        assertNotNull(result);
        verify(auditService, times(1)).log(eq("TOGGLE_FORM_STATUS"), eq("FORM"), eq(formId), anyString());
    }

    @Test
    void scheduleFormDeactivation_Success() {
        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        when(formRepository.save(any(Form.class))).thenReturn(form);
        when(formMapper.toDto(any(Form.class))).thenReturn(formDto);

        FormDto result = formService.scheduleFormDeactivation(formId, 7);

        assertNotNull(result);
        verify(formRepository).save(argThat(f -> f.getExpiresAt() != null));
    }

    @Test
    void deleteForm_Success() {
        when(formRepository.existsById(formId)).thenReturn(true);
        
        formService.deleteForm(formId);

        verify(formRepository, times(1)).deleteById(formId);
        verify(auditService).log(eq("DELETE_FORM"), eq("FORM"), eq(formId), anyString());
    }

    @Test
    void deleteForm_NotFound_ThrowsResourceNotFoundException() {
        when(formRepository.existsById(formId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> formService.deleteForm(formId));
    }

    @Test
    @SuppressWarnings("unchecked")
    void getResponsesByFormId_WithSearch_CallsSearchRepo() {
        String search = "test-keyword";
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        when(formResponseRepository.searchByFormId(eq(formId), eq(search), any(), any(), eq(pageable)))
                .thenReturn(org.springframework.data.domain.Page.empty());

        formService.getResponsesByFormId(formId, search, null, null, pageable);

        verify(formResponseRepository, times(1)).searchByFormId(eq(formId), eq(search), any(), any(), eq(pageable));
        verify(formResponseRepository, never()).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void getResponsesByFormId_WithoutSearch_CallsFindAllWithSpec() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        when(formResponseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable)))
                .thenReturn(org.springframework.data.domain.Page.empty());

        formService.getResponsesByFormId(formId, null, null, null, pageable);

        verify(formResponseRepository, times(1)).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
        verify(formResponseRepository, never()).searchByFormId(any(), any(), any(), any(), any());
    }

    @Test
    void exportResponsesToCsv_WithSearch_ShouldPassSearchToRepo() {
        String search = "anuma";
        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        doReturn(Collections.emptyList()).when(formResponseRepository).searchByFormIdBulk(eq(formId), eq(search), any(), any());
        
        byte[] result = formService.exportResponsesToCsv(formId, search, null, null);
        
        assertNotNull(result);
        verify(formResponseRepository).searchByFormIdBulk(eq(formId), eq(search), any(), any());
    }

    @Test
    void updateForm_WithUnchangedPastStartDate_ShouldSucceed() {
        LocalDateTime pastDate = LocalDateTime.now().minusDays(10);
        form.setStartsAt(pastDate);
        formRequest.setStartsAt(pastDate); // Keep identical past date

        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        when(formRepository.save(any(Form.class))).thenReturn(form);
        when(formMapper.toDto(any(Form.class))).thenReturn(formDto);

        FormDto result = formService.updateForm(formId, formRequest);
        
        assertNotNull(result);
        verify(formRepository).save(any(Form.class));
    }

    @Test
    void updateForm_WithNewPastStartDate_ShouldFail() {
        LocalDateTime oldDate = LocalDateTime.now().minusDays(10);
        LocalDateTime newPastDate = LocalDateTime.now().minusDays(5);
        form.setStartsAt(oldDate);
        formRequest.setStartsAt(newPastDate); // CHANGED to a new past date

        when(formRepository.findById(formId)).thenReturn(Optional.of(form));

        assertThrows(BusinessLogicException.class, () -> {
            formService.updateForm(formId, formRequest);
        });
    }

    @Test
    void updateForm_WithPastExpirationDate_ShouldFail() {
        LocalDateTime pastExpiry = LocalDateTime.now().minusDays(1);
        formRequest.setExpiresAt(pastExpiry);

        when(formRepository.findById(formId)).thenReturn(Optional.of(form));

        assertThrows(BusinessLogicException.class, () -> {
            formService.updateForm(formId, formRequest);
        });
    }

    @Test
    void updateForm_WithExpirationBeforeStart_ShouldFail() {
        LocalDateTime start = LocalDateTime.now().plusDays(10);
        LocalDateTime end = LocalDateTime.now().plusDays(5);
        formRequest.setStartsAt(start);
        formRequest.setExpiresAt(end);

        when(formRepository.findById(formId)).thenReturn(Optional.of(form));

        assertThrows(BusinessLogicException.class, () -> {
            formService.updateForm(formId, formRequest);
        });
    }

    @Test
    void exportResponsesToCsv_WithDateRange_ShouldPassToRepo() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(1);
        when(formRepository.findById(formId)).thenReturn(Optional.of(form));
        doReturn(Collections.emptyList()).when(formResponseRepository).searchByFormIdBulk(eq(formId), isNull(), eq(start), eq(end));
        
        byte[] result = formService.exportResponsesToCsv(formId, null, start, end);
        
        assertNotNull(result);
        verify(formResponseRepository).searchByFormIdBulk(eq(formId), isNull(), eq(start), eq(end));
    }

    @Test
    void saveDraft_NewSession_ShouldSucceed() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        
        com.formcraft.entity.builder.FormDraft draft = new com.formcraft.entity.builder.FormDraft();
        UUID draftId = UUID.randomUUID();
        draft.setId(draftId);
        
        when(formDraftRepository.save(any(com.formcraft.entity.builder.FormDraft.class))).thenReturn(draft);
        
        UUID result = formService.saveDraft(null, formId, formRequest);
        
        assertEquals(draftId, result);
        verify(formDraftRepository).save(any(com.formcraft.entity.builder.FormDraft.class));
    }
}
