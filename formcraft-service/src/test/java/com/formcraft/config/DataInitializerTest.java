package com.formcraft.config;

import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Test
    void run_ShouldTriggerSeedingSequence() throws Exception {
        // Mock the singular proxy call which is the real transactional boundary
        doNothing().when(self).seedTemplate(any(), any(), any(), any());

        dataInitializer.run();

        verify(roleRepository, atLeastOnce()).findByName(any());
        verify(self, atLeast(1)).seedTemplate(any(), any(), any(), any());
    }
}
