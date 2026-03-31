package com.formcraft.service.impl;
 
import com.formcraft.dto.TemplateDTO;
import com.formcraft.entity.Template;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.TemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
 
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
 
@ExtendWith(MockitoExtension.class)
class TemplateServiceImplTest {
 
    @Mock
    private TemplateRepository templateRepository;
 
    @Mock
    private CategoryRepository categoryRepository;
 
    @Mock
    private SecurityContext securityContext;
 
    @Mock
    private Authentication authentication;
 
    @Mock
    private com.formcraft.service.AuditService auditService;
 
    @InjectMocks
    private TemplateServiceImpl templateService;
 
    private Template template;
    private TemplateDTO templateDTO;
    private UUID templateId;
 
    @BeforeEach
    void setUp() {
        templateId = UUID.randomUUID();
        
        templateDTO = TemplateDTO.builder()
                .name("Standard Blueprint")
                .description("Industry standard testing blueprint")
                .build();
                
        template = Template.builder()
                .id(templateId)
                .name("Standard Blueprint")
                .schema(new HashMap<>())
                .global(false)
                .requestedForGlobal(false)
                .build();
        
        // Identity Registry Protocol: Manual injection of audit telemetry
        template.setCreatedBy("testuser");
                
        SecurityContextHolder.setContext(securityContext);
    }
 
    @Test
    void createTemplate_Success() {
        when(templateRepository.save(any(Template.class))).thenReturn(template);
 
        TemplateDTO result = templateService.createTemplate(templateDTO);
 
        assertNotNull(result);
        assertEquals("Standard Blueprint", result.getName());
        verify(templateRepository, times(1)).save(any(Template.class));
    }
 
    @Test
    void promoteToGlobal_Success() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(Template.class))).thenReturn(template);
 
        TemplateDTO result = templateService.promoteToGlobal(templateId);
 
        assertTrue(result.isGlobal());
        verify(templateRepository, times(1)).save(template);
    }
 
    @Test
    void requestGlobalPromotion_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(Template.class))).thenReturn(template);
 
        TemplateDTO result = templateService.requestGlobalPromotion(templateId);
 
        assertTrue(result.isRequestedForGlobal());
    }
 
    @Test
    void requestGlobalPromotion_Unauthorized_ThrowsBusinessLogicException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("intruder");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
 
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            templateService.requestGlobalPromotion(templateId);
        });
 
        assertTrue(exception.getMessage().contains("Identity awareness failed"));
    }
 
    @Test
    void getTemplateById_NotFound_ThrowsResourceNotFoundException() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.empty());
 
        assertThrows(ResourceNotFoundException.class, () -> {
            templateService.getTemplateById(templateId);
        });
    }
}
