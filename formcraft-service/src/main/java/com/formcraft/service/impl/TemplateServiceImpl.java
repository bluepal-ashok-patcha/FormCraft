package com.formcraft.service.impl;

import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.entity.Category;
import com.formcraft.entity.Template;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.service.TemplateService;
import lombok.RequiredArgsConstructor;
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

        Template template = Template.builder()
                .name(templateDTO.getName())
                .description(templateDTO.getDescription())
                .category(category)
                .schema(templateDTO.getSchema())
                .global(false)
                .requestedForGlobal(false)
                .thumbnailUrl(templateDTO.getThumbnailUrl())
                .build();
        
        Template saved = templateRepository.save(template);
        return mapToDTO(saved);
    }

    @Override
    public List<TemplateDTO> getAllVisibleTemplates(String filter) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
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
                templates = templateRepository.findAll();
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
                .orElseThrow(() -> new RuntimeException("Template not found"));
        return mapToDTO(template);
    }

    @Override
    @Transactional
    public void deleteTemplate(UUID id) {
        templateRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TemplateDTO promoteToGlobal(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        template.setGlobal(true);
        return mapToDTO(templateRepository.save(template));
    }

    @Override
    @Transactional
    public TemplateDTO requestGlobalPromotion(UUID id) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        
        if (!template.getCreatedBy().equals(currentUser)) {
            throw new RuntimeException("You can only request promotion for your own templates");
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
