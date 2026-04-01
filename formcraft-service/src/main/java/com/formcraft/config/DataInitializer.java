package com.formcraft.config;

import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.util.RoleName;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TemplateRepository templateRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataInitializer self;

    public DataInitializer(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TemplateRepository templateRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder,
            @org.springframework.context.annotation.Lazy DataInitializer self) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.templateRepository = templateRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.self = self;
    }

    @Value("${app.admin.password:Password@123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing tactical data seeding...");
        seedRoles();
        seedSuperAdmin();
        seedTemplates(); // Internal call to private collector
        log.info("Data initialization sequence completed.");
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                log.info("Role registered in registry: {}", roleName);
            }
        }
    }

    private void seedSuperAdmin() {
        String adminUsername = "superadmin";
        String adminEmail = "admin@formcraft.com";

        if (userRepository.findByUsername(adminUsername).isEmpty() && 
            userRepository.findByEmail(adminEmail).isEmpty()) {
            
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setFullName("System Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setCreatedBy("SYSTEM");
            admin.setActive(true);

            Set<Role> roles = new HashSet<>();
            roleRepository.findByName(RoleName.ROLE_SUPER_ADMIN).ifPresent(roles::add);
            roleRepository.findByName(RoleName.ROLE_ADMIN).ifPresent(roles::add);
            admin.setRoles(roles);

            userRepository.save(admin);
            log.info("Super Admin account provisioned: {} / {} ", adminUsername, adminEmail);
        } else {
            userRepository.findByUsername(adminUsername).ifPresent(u -> {
                if (!u.isActive()) {
                    u.setActive(true);
                    userRepository.save(u);
                    log.info("Super Admin account restored to ACTIVE status.");
                }
            });
            log.info("Super Admin account identity already verified in registry.");
        }
    }

    void seedTemplates() {
        log.info("Initializing Strategic Asset Seeding (Global Templates)...");
        
        self.seedTemplate("Standard Enrollment Protocol", 
            "Professional user registration architecture for secure member acquisition.", 
            "USER_REGISTRATION", 
            "{\"fields\": [" +
                "{\"id\": \"onb_1\", \"type\": \"text\", \"label\": \"Full Legal Name\", \"required\": true, \"placeholder\": \"Ex. John Doe\"}," +
                "{\"id\": \"onb_2\", \"type\": \"email\", \"label\": \"Corporate Email\", \"required\": true, \"placeholder\": \"admin@company.com\"}," +
                "{\"id\": \"onb_3\", \"type\": \"text\", \"label\": \"Telecommunication Contact\", \"required\": false, \"placeholder\": \"+1 (555) 000-0000\"}," +
                "{\"id\": \"onb_4\", \"type\": \"textarea\", \"label\": \"Professional Biography\", \"required\": false}," +
                "{\"id\": \"onb_5\", \"type\": \"checkbox\", \"label\": \"Agrees to Protocol Terms\", \"options\": [\"I accept the terms and conditions\"], \"required\": true}" +
            "]}");

        self.seedTemplate("Corporate Inquiry Portal", 
            "Standardized contact protocol for professional inbound inquiries.", 
            "CONTACT_PROTOCOL", 
            "{\"fields\": [" +
                "{\"id\": \"con_1\", \"type\": \"dropdown\", \"label\": \"Inquiry Vector\", \"options\": [\"Sales\", \"Support\", \"Partnership\"], \"required\": true}," +
                "{\"id\": \"con_2\", \"type\": \"text\", \"label\": \"Company Designation\", \"required\": false, \"placeholder\": \"Ex. Acme Corp\"}," +
                "{\"id\": \"con_3\", \"type\": \"textarea\", \"label\": \"Briefing Summary\", \"required\": true, \"placeholder\": \"Describe your requirement...\"}," +
                "{\"id\": \"con_4\", \"type\": \"dropdown\", \"label\": \"Preferred Response Channel\", \"options\": [\"Email\", \"Phone Call\", \"System Message\"], \"required\": false}," +
                "{\"id\": \"con_5\", \"type\": \"radio\", \"label\": \"Urgency Level\", \"options\": [\"Routine\", \"High\", \"Critical\"], \"required\": true}" +
            "]}");

        self.seedTemplate("Strategic Feedback Survey", 
            "Data harvesting blueprint for product satisfaction and growth metrics.", 
            "FEEDBACK_SURVEY", 
            "{\"fields\": [" +
                "{\"id\": \"fed_1\", \"type\": \"number\", \"label\": \"Satisfaction Index (1-10)\", \"required\": true}," +
                "{\"id\": \"fed_2\", \"type\": \"dropdown\", \"label\": \"Utilization Frequency\", \"options\": [\"Daily\", \"Weekly\", \"Occasionally\"], \"required\": false}," +
                "{\"id\": \"fed_3\", \"type\": \"textarea\", \"label\": \"Optimization Suggestions\", \"required\": false}," +
                "{\"id\": \"fed_4\", \"type\": \"radio\", \"label\": \"Net Promoter Score\", \"options\": [\"Detractor\", \"Passive\", \"Promoter\"], \"required\": true}" +
            "]}");

        self.seedTemplate("Operational Service Ticket", 
            "Tactical request architecture for internal support and task tracking.", 
            "SERVICE_REQUEST", 
            "{\"fields\": [" +
                "{\"id\": \"srv_1\", \"type\": \"text\", \"label\": \"Asset Identifier\", \"required\": true, \"placeholder\": \"Ex. LPT-4022\"}," +
                "{\"id\": \"srv_2\", \"type\": \"text\", \"label\": \"Department Segment\", \"required\": false, \"placeholder\": \"Ex. Engineering\"}," +
                "{\"id\": \"srv_3\", \"type\": \"textarea\", \"label\": \"Anomaly Description\", \"required\": true}," +
                "{\"id\": \"srv_4\", \"type\": \"dropdown\", \"label\": \"Impact Zone\", \"options\": [\"Software\", \"Hardware\", \"Network\"], \"required\": true}" +
            "]}");

        self.seedTemplate("Executive Event RSVP", 
            "Premium attendance registry for high-level corporate events.", 
            "EVENT_RSVP", 
            "{\"fields\": [" +
                "{\"id\": \"evt_1\", \"type\": \"number\", \"label\": \"Guest Count\", \"required\": true}," +
                "{\"id\": \"evt_2\", \"type\": \"date\", \"label\": \"Arrival Timestamp\", \"required\": false}," +
                "{\"id\": \"evt_3\", \"type\": \"radio\", \"label\": \"Deployment Mode\", \"options\": [\"In-Person\", \"Virtual Link\"], \"required\": true}," +
                "{\"id\": \"evt_4\", \"type\": \"textarea\", \"label\": \"Dietary Requirements\", \"required\": false}" +
            "]}");
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void seedTemplate(String name, String desc, String categoryName, String schemaJson) {
        if (templateRepository.findAll().stream().anyMatch(t -> t.getName().equals(name))) {
            return;
        }

        categoryRepository.findByName(categoryName).ifPresent(category -> {
            try {
                com.formcraft.entity.Template template = new com.formcraft.entity.Template();
                template.setName(name);
                template.setDescription(desc);
                template.setCategory(category);
                template.setGlobal(true);
                template.setCreatedBy("SYSTEM");
                template.setCreatedAt(LocalDateTime.now());
                template.setUpdatedAt(LocalDateTime.now());
                
                // Parse JSONB
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                template.setSchema(mapper.readValue(schemaJson, java.util.Map.class));
                
                templateRepository.save(template);
                log.info("Certified Blueprint Deployed to Registry: {} [{}]", name, categoryName);
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                log.error("Registry Sync Failure: Schema corruption in template {}: {}", name, e.getMessage());
            } catch (Exception e) {
                log.error("Registry Sync Failure for template {}: {}", name, e.getMessage(), e);
            }
        });
    }
}
