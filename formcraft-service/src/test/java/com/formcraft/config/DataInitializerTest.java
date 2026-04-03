package com.formcraft.config;

import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.util.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private TemplateRepository templateRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private DataInitializer self;

    @InjectMocks
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dataInitializer, "adminPassword", "Password@123");
        ReflectionTestUtils.setField(dataInitializer, "self", dataInitializer);
    }

    @Test
    void run_ShouldSeedData_WhenDatabaseIsEmpty() throws Exception {
        // Arrange
        when(roleRepository.findByName(any())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.ROLE_SUPER_ADMIN)).thenReturn(Optional.of(new Role()));

        // Act
        dataInitializer.run();

        // Assert
        verify(roleRepository, atLeastOnce()).save(any(Role.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void seedSuperAdmin_ShouldActivateExistUser_WhenInactive() throws Exception {
        // Arrange
        User inactiveAdmin = new User();
        inactiveAdmin.setActive(false);
        when(userRepository.findByUsername("superadmin")).thenReturn(Optional.of(inactiveAdmin));

        // Act
        dataInitializer.run(); // This calls seedSuperAdmin via run

        // Assert
        verify(userRepository).save(inactiveAdmin);
    }

    @Test
    void seedTemplate_ShouldSkip_WhenAlreadyExists() {
        // Arrange
        com.formcraft.entity.Template existing = new com.formcraft.entity.Template();
        existing.setName("Standard Enrollment Protocol");
        when(templateRepository.findAll()).thenReturn(java.util.List.of(existing));

        // Act
        dataInitializer.seedTemplate("Standard Enrollment Protocol", "desc", "cat", "{}");

        // Assert
        verify(templateRepository, never()).save(any());
    }

    @Test
    void seedTemplate_ShouldSave_WhenCategoryExists() {
        // Arrange
        when(templateRepository.findAll()).thenReturn(java.util.List.of());
        when(categoryRepository.findByName("USER_REGISTRATION")).thenReturn(Optional.of(new com.formcraft.entity.Category()));

        // Act
        dataInitializer.seedTemplate("Test Template", "desc", "USER_REGISTRATION", "{\"key\":\"value\"}");

        // Assert
        verify(templateRepository).save(any());
    }
}
