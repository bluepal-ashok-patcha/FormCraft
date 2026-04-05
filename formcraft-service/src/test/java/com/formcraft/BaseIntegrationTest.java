package com.formcraft;
 
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.utility.DockerImageName;
import org.springframework.test.context.ActiveProfiles;
 
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {
 
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("formcraft_test")
            .withUsername("test")
            .withPassword("test");

    @ServiceConnection
    static final KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("apache/kafka:3.7.0"));
 
    static {
        postgres.start();
        kafka.start();
    }
}
