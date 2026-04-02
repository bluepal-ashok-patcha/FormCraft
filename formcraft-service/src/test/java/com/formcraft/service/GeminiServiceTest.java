package com.formcraft.service;
 
import com.formcraft.exception.AiProtocolException;
// High-Fidelity Registry Sync: GeminiService is located in the com.formcraft.service package
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;
 
import java.io.IOException;
import java.util.Collections;
 
class GeminiServiceTest {
 
    private MockWebServer mockWebServer;
    private GeminiService geminiService;
 
    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
 
        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();
 
        geminiService = new GeminiService(webClient);
    }
 
    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }
 
    @Test
    void generateContent_Success_ShouldReturnsRawJson() {
        // High-Fidelity JSON Registry Sync: Digital backslashes must be double-escaped for Jackson parsing
        String mockResponse = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"```json\\n{ \\\"regex\\\": \\\"\\\\\\\\d+\\\", \\\"errorMessage\\\": \\\"Digits only\\\" }\\n```\" } ] } } ] }";
        
        mockWebServer.enqueue(new MockResponse()
                .setBody(mockResponse)
                .addHeader("Content-Type", "application/json"));
 
        StepVerifier.create(geminiService.generateContent("prompt"))
                .expectNextMatches(json -> json.contains("regex") && json.contains("\\d+"))
                .verifyComplete();
    }
 
    @Test
    void generateFormBlueprint_Success_ShouldRecalibrateNeuralSchema() {
        // High-Fidelity Signature Sync: generateFormBlueprint(String, List)
        String mockResponse = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"```json\\n[ { \\\"id\\\": \\\"f1\\\", \\\"name\\\": \\\"Test Form\\\", \\\"fields\\\": [] } ]\\n```\" } ] } } ] }";
        
        mockWebServer.enqueue(new MockResponse()
                .setBody(mockResponse)
                .addHeader("Content-Type", "application/json"));
 
        StepVerifier.create(geminiService.generateFormBlueprint("test description", Collections.emptyList()))
                .expectNextMatches(blueprint -> blueprint.contains("Test Form"))
                .verifyComplete();
    }
 
    @Test
    void generateThemeBlueprint_Success_ShouldReturnsStyleMap() {
        // High-Fidelity Naming Sync: generateThemeBlueprint 
        String mockResponse = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"```json\\n{ \\\"themeColor\\\": \\\"#4F46E5\\\" }\\n```\" } ] } } ] }";
        
        mockWebServer.enqueue(new MockResponse()
                .setBody(mockResponse)
                .addHeader("Content-Type", "application/json"));
 
        StepVerifier.create(geminiService.generateThemeBlueprint("ocean"))
                .expectNextMatches(theme -> theme.contains("themeColor") && theme.contains("#4F46E5"))
                .verifyComplete();
    }
 
    @Test
    void handleError_ShouldTriggerAiProtocolRefusal() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));
 
        StepVerifier.create(geminiService.generateContent("fail"))
                .expectError(AiProtocolException.class)
                .verify();
    }
}
