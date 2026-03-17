package com.formcraft.service;

import com.formcraft.dto.TemplateDTO;
import com.formcraft.dto.CategoryDTO;
import java.util.List;
import java.util.UUID;

public interface TemplateService {
    TemplateDTO createTemplate(TemplateDTO templateDTO);
    List<TemplateDTO> getAllVisibleTemplates();
    TemplateDTO getTemplateById(UUID id);
    void deleteTemplate(UUID id);
    TemplateDTO promoteToGlobal(UUID id);
    List<CategoryDTO> getAllCategories();
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    void deleteCategory(Integer id);
}
