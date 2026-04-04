package com.formcraft.service.impl;

import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.entity.Category;
import com.formcraft.entity.Template;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TemplateServiceImplTest {

    @Mock
    private TemplateRepository templateRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private TemplateServiceImpl templateService;

    private Template template;
    private TemplateDTO templateDTO;
    private Category category;
    private UUID templateId;

    @BeforeEach
    void setUp() {
        templateId = UUID.randomUUID();
        category = Category.builder().id(1).name("IT").label("Information Tech").build();
        
        template = Template.builder()
                .id(templateId)
                .name("Test Template")
                .description("Desc")
                .category(category)
                .global(false)
                .requestedForGlobal(false)
                .build();
        template.setCreatedBy("testuser");

        CategoryDTO catDTO = CategoryDTO.builder().id(1).name("IT").label("Information Tech").build();
        templateDTO = TemplateDTO.builder()
                .name("Test Template")
                .description("Desc")
                .category(catDTO)
                .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createTemplate_AsSuperAdmin_ShouldBeGlobal() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubRole("ROLE_SUPER_ADMIN");
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(templateRepository.save(any(Template.class))).thenAnswer(i -> {
            Template t = i.getArgument(0);
            t.setId(templateId);
            return t;
        });

        TemplateDTO result = templateService.createTemplate(templateDTO);

        assertTrue(result.isGlobal());
        verify(auditService).log(eq("CREATE_TEMPLATE"), anyString(), any(), anyString());
    }

    @Test
    void getAllVisibleTemplates_AsRegularUser_ShouldCallVisible() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubAuth("ROLE_ADMIN", "testuser");
        when(templateRepository.findAllVisible("testuser")).thenReturn(List.of(template));

        List<TemplateDTO> result = templateService.getAllVisibleTemplates(null);

        assertEquals(1, result.size());
        verify(templateRepository).findAllVisible("testuser");
    }

    @Test
    void getAllVisibleTemplates_AsSuperAdmin_WithRequestedFilter() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubRole("ROLE_SUPER_ADMIN");
        when(templateRepository.findByRequestedForGlobalTrueAndGlobalFalse()).thenReturn(List.of(template));

        List<TemplateDTO> result = templateService.getAllVisibleTemplates("requested");

        assertEquals(1, result.size());
    }

    @Test
    void updateTemplate_NotOwner_ShouldFail() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubAuth("ROLE_ADMIN", "otheruser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));

        assertThrows(com.formcraft.exception.BusinessLogicException.class, () -> 
            templateService.updateTemplate(templateId, templateDTO));
    }

    @Test
    void updateTemplate_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubAuth("ROLE_ADMIN", "testuser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(Template.class))).thenReturn(template);

        TemplateDTO result = templateService.updateTemplate(templateId, templateDTO);

        assertNotNull(result);
        verify(auditService).log(eq("UPDATE_TEMPLATE"), anyString(), any(), anyString());
    }

    @Test
    void deleteTemplate_IsGlobal_NonAdmin_ShouldFail() {
        template.setGlobal(true);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubAuth("ROLE_ADMIN", "testuser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));

        assertThrows(com.formcraft.exception.BusinessLogicException.class, () -> 
            templateService.deleteTemplate(templateId));
    }

    @Test
    void promoteToGlobal_Success() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(Template.class))).thenReturn(template);

        templateService.promoteToGlobal(templateId);

        assertTrue(template.isGlobal());
        verify(auditService).log(eq("PROMOTE_TEMPLATE"), anyString(), any(), anyString());
    }

    @Test
    void requestGlobalPromotion_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubUsername("testuser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(Template.class))).thenReturn(template);

        templateService.requestGlobalPromotion(templateId);

        assertTrue(template.isRequestedForGlobal());
    }

    @Test
    void createCategory_Success() {
        CategoryDTO dto = CategoryDTO.builder().name("New Cat").label("Label").build();
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        CategoryDTO result = templateService.createCategory(dto);

        assertEquals("NEW_CAT", result.getName());
    }

    @Test
    void getAllVisibleTemplates_SuperAdmin_VariousFilters() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubRole("ROLE_SUPER_ADMIN");
        
        when(templateRepository.findByGlobal(true)).thenReturn(Collections.emptyList());
        when(templateRepository.findByGlobal(false)).thenReturn(Collections.emptyList());
        when(templateRepository.findAll()).thenReturn(Collections.emptyList());

        templateService.getAllVisibleTemplates("true");
        templateService.getAllVisibleTemplates("false");
        templateService.getAllVisibleTemplates(null);

        verify(templateRepository).findByGlobal(true);
        verify(templateRepository).findByGlobal(false);
        verify(templateRepository).findAll();
    }

    @Test
    void decertifyTemplate_Success() {
        template.setGlobal(true);
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenReturn(template);

        TemplateDTO result = templateService.decertifyTemplate(templateId);

        assertFalse(result.isGlobal());
        verify(auditService).log(eq("DECERTIFY_TEMPLATE"), anyString(), eq(templateId), anyString());
    }

    @Test
    void rejectPromotion_Success() {
        template.setRequestedForGlobal(true);
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenReturn(template);

        TemplateDTO result = templateService.rejectPromotion(templateId);

        assertFalse(result.isRequestedForGlobal());
    }

    @Test
    void cancelPromotionRequest_Success() {
        template.setRequestedForGlobal(true);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        stubUsername("testuser");
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenReturn(template);

        TemplateDTO result = templateService.cancelPromotionRequest(templateId);

        assertFalse(result.isRequestedForGlobal());
    }

    @Test
    void getAllCategories_ShouldReturnList() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        List<CategoryDTO> result = templateService.getAllCategories();
        assertEquals(1, result.size());
    }

    @Test
    void deleteCategory_Success() {
        templateService.deleteCategory(1);
        verify(categoryRepository).deleteById(1);
    }

    @SuppressWarnings("unchecked")
    private void stubAuth(String role, String username) {
        stubUsername(username);
        stubRole(role);
    }

    private void stubUsername(String username) {
        when(authentication.getName()).thenReturn(username);
    }

    @SuppressWarnings("unchecked")
    private void stubRole(String role) {
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
    }
}
