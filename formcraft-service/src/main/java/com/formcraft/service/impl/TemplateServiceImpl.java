package com.formcraft.service.impl;

import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.entity.Category;
import com.formcraft.entity.Template;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public TemplateDTO createTemplate(TemplateDTO templateDTO) {
        Category category = null;
        if (templateDTO.getCategory() != null && templateDTO.getCategory().getId() != null) {
            category = categoryRepository.findById(templateDTO.getCategory().getId())
                    .orElse(null);
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = auth != null && auth.getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Template template = Template.builder()
                .name(templateDTO.getName())
                .description(templateDTO.getDescription())
                .category(category)
                .schema(templateDTO.getSchema())
                .global(isSuperAdmin)
                .requestedForGlobal(false)
                .thumbnailUrl(templateDTO.getThumbnailUrl())
                .build();
        
        Template saved = templateRepository.save(template);
        return mapToDTO(saved);
    }

    @Override
    public List<TemplateDTO> getAllVisibleTemplates(String filter) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth != null ? auth.getName() : null;
        boolean isSuperAdmin = auth != null && auth.getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        List<Template> templates;

        if (isSuperAdmin) {
            if ("requested".equalsIgnoreCase(filter)) {
                templates = templateRepository.findByRequestedForGlobalTrueAndGlobalFalse();
            } else if ("true".equalsIgnoreCase(filter)) {
                templates = templateRepository.findByGlobal(true);
            } else if ("false".equalsIgnoreCase(filter)) {
                templates = templateRepository.findByGlobal(false);
            } else {
                templates = templateRepository.findAll().stream()
                        .filter(t -> t.isGlobal() || t.isRequestedForGlobal())
                        .collect(Collectors.toList());
            }
        } else {
            templates = templateRepository.findAllVisible(currentUser);
            if ("requested".equalsIgnoreCase(filter)) {
                templates = templates.stream()
                        .filter(Template::isRequestedForGlobal)
                        .collect(Collectors.toList());
            } else if ("true".equalsIgnoreCase(filter)) {
                templates = templates.stream()
                        .filter(Template::isGlobal)
                        .collect(Collectors.toList());
            } else if ("false".equalsIgnoreCase(filter)) {
                templates = templates.stream()
                        .filter(t -> !t.isGlobal())
                        .collect(Collectors.toList());
            }
        }

        return templates.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TemplateDTO getTemplateById(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new com.formcraft.exception.ResourceNotFoundException("Strategic Asset Error: Template not found with identifier " + id));
        return mapToDTO(template);
    }

    @Override
    @Transactional
    public TemplateDTO updateTemplate(UUID id, TemplateDTO templateDTO) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new com.formcraft.exception.ResourceNotFoundException("Strategic Asset Error: Template not found with identifier " + id));

        // Enterprise Authority Pulse: Protect certified blueprints from non-super-admins
        if (!isSuperAdmin) {
            if (template.isGlobal()) {
                throw new com.formcraft.exception.BusinessLogicException("Security Rejection: Certified blueprints are protected from standard admin refinement pulses.");
            }
            if (!template.getCreatedBy().equals(currentUser)) {
                throw new com.formcraft.exception.BusinessLogicException("Identity Mismatch: You can only refine architectural blueprints registered to your own identity.");
            }
        }

        template.setName(templateDTO.getName());
        template.setDescription(templateDTO.getDescription());
        template.setSchema(templateDTO.getSchema());
        template.setThumbnailUrl(templateDTO.getThumbnailUrl());

        if (templateDTO.getCategory() != null && templateDTO.getCategory().getId() != null) {
            Category category = categoryRepository.findById(templateDTO.getCategory().getId()).orElse(null);
            template.setCategory(category);
        }

        return mapToDTO(templateRepository.save(template));
    }

    @Override
    @Transactional
    public void deleteTemplate(UUID id) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new com.formcraft.exception.ResourceNotFoundException("Registry Error: Template not found for purge pulse."));

        // Pulse Deletion Guard
        if (!isSuperAdmin) {
            if (template.isGlobal()) {
                throw new com.formcraft.exception.BusinessLogicException("Security Rejection: Only a Super Admin can purge certified blueprint assets from the enterprise hub.");
            }
            if (!template.getCreatedBy().equals(currentUser)) {
                throw new com.formcraft.exception.BusinessLogicException("Identity Mismatch: You can only purge architectural blueprints registered to your own identity.");
            }
        }

        templateRepository.delete(template);
    }

    @Override
    @Transactional
    public TemplateDTO promoteToGlobal(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new com.formcraft.exception.ResourceNotFoundException("Governance Error: Target asset not found for global promotion."));
        template.setGlobal(true);
        return mapToDTO(templateRepository.save(template));
    }

    @Override
    @Transactional
    public TemplateDTO requestGlobalPromotion(UUID id) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new com.formcraft.exception.ResourceNotFoundException("Governance Error: Target asset not found for promotion request."));
        
        if (!template.getCreatedBy().equals(currentUser)) {
            throw new com.formcraft.exception.BusinessLogicException("Strategic Conflict: Identity awareness failed. You can only request promotion for your own architectural templates.");
        }
        
        template.setRequestedForGlobal(true);
        return mapToDTO(templateRepository.save(template));
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> CategoryDTO.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .label(cat.getLabel())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = Category.builder()
                .name(categoryDTO.getName().toUpperCase().replace(" ", "_"))
                .label(categoryDTO.getLabel())
                .build();
        
        Category saved = categoryRepository.save(category);
        return CategoryDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .label(saved.getLabel())
                .build();
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TemplateDTO decertifyTemplate(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Architecture Registry: Blueprint asset not found."));

        template.setGlobal(false);
        template.setRequestedForGlobal(false);
        Template updated = templateRepository.save(template);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public TemplateDTO rejectPromotion(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Architecture Registry: Blueprint asset not found."));

        template.setRequestedForGlobal(false);
        Template updated = templateRepository.save(template);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public TemplateDTO cancelPromotionRequest(UUID id) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Architecture Registry: Blueprint asset not found."));

        if (!template.getCreatedBy().equals(currentUser)) {
            throw new com.formcraft.exception.BusinessLogicException("Identity Mismatch: You can only cancel promotion requests for templates you created.");
        }

        if (!template.isRequestedForGlobal()) {
            throw new com.formcraft.exception.BusinessLogicException("Governance Conflict: No pending promotion request found for this template.");
        }

        template.setRequestedForGlobal(false);
        Template updated = templateRepository.save(template);
        return mapToDTO(updated);
    }

    private TemplateDTO mapToDTO(Template template) {
        CategoryDTO categoryDTO = null;
        if (template.getCategory() != null) {
            categoryDTO = CategoryDTO.builder()
                    .id(template.getCategory().getId())
                    .name(template.getCategory().getName())
                    .label(template.getCategory().getLabel())
                    .build();
        }

        return TemplateDTO.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .category(categoryDTO)
                .schema(template.getSchema())
                .global(template.isGlobal())
                .requestedForGlobal(template.isRequestedForGlobal())
                .createdAt(template.getCreatedAt())
                .createdBy(template.getCreatedBy())
                .thumbnailUrl(template.getThumbnailUrl())
                .build();
    }
}
