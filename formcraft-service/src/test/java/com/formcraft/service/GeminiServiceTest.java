package com.formcraft.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.AiProtocolException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * High-End Reactive Coverage for the AI Gateway.
 * Targets the complex WebClient chains and JSON synthesis logic.
 */
@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    private GeminiService geminiService;

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Deep stubbing the WebClient chain using explicit casting to avoid generic capture errors
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        doReturn(requestHeadersSpec).when(requestBodyUriSpec).bodyValue(any());
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        
        // Mocking base onStatus (handling error statuses)
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);

        geminiService = new GeminiService(webClient);
    }

    @Test
    void generateContent_Success() throws JsonProcessingException {
        // 1. Arrange: Valid AI Response Json
        String mockResponseJson = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"{ \\\"regex\\\": \\\"^[0-9]+$\\\", \\\"errorMessage\\\": \\\"Only numbers!\\\" }\" } ] } } ] }";
        JsonNode mockJsonNode = objectMapper.readTree(mockResponseJson);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        // 2. Act & Assert
        StepVerifier.create(geminiService.generateContent("Create numeric regex"))
                .expectNext("{ \"regex\": \"^[0-9]+$\", \"errorMessage\": \"Only numbers!\" }")
                .verifyComplete();
    }

    @Test
    void generateFormBlueprint_WithMarkdown_Success() throws JsonProcessingException {
        // 1. Arrange: AI Response with Markdown wrapper (we must clean this)
        String mockResponseJson = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"```json\\n[{\\\"id\\\":\\\"q1\\\"}]\\n```\" } ] } } ] }";
        JsonNode mockJsonNode = objectMapper.readTree(mockResponseJson);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        // 2. Act & Assert: Should be cleaned
        StepVerifier.create(geminiService.generateFormBlueprint("Form about dogs", Collections.emptyList()))
                .expectNext("[{\"id\":\"q1\"}]")
                .verifyComplete();
    }

    @Test
    void generateThemeBlueprint_Success() throws JsonProcessingException {
        // Arrange
        String mockResponseJson = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"{ \\\"themeColor\\\": \\\"#2563eb\\\" }\" } ] } } ] }";
        JsonNode mockJsonNode = objectMapper.readTree(mockResponseJson);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        // Act & Assert
        StepVerifier.create(geminiService.generateThemeBlueprint("FormCraft 2026 Edition"))
                .expectNext("{ \"themeColor\": \"#2563eb\" }")
                .verifyComplete();
    }

    @Test
    void generateContent_ShouldFail_WhenCandidatesMissing() throws JsonProcessingException {
        // 1. Arrange: Empty candidates list (Safety Intercept)
        String mockResponseJson = "{ \"candidates\": [] }";
        JsonNode mockJsonNode = objectMapper.readTree(mockResponseJson);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        // 2. Act & Assert
        StepVerifier.create(geminiService.generateContent("Trigger safety intercept"))
                .expectError(AiProtocolException.class)
                .verify();
    }

    @Test
    void generateContent_ShouldFail_WhenApiReturnsError() {
        // 1. Arrange: Setup onStatus failure
        when(responseSpec.onStatus(any(), any())).thenAnswer(invocation -> {
            java.util.function.Predicate<HttpStatusCode> predicate = invocation.getArgument(0);
            
            // Simulating a 500 error
            if (predicate.test(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)) {
                // We return a mock response that triggers the error flow
                org.springframework.web.reactive.function.client.ClientResponse mockResponse = mock(org.springframework.web.reactive.function.client.ClientResponse.class);
                lenient().when(mockResponse.statusCode()).thenReturn(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
                lenient().when(mockResponse.bodyToMono(String.class)).thenReturn(Mono.just("Google Server Melted"));
                
                return responseSpec; // In real logic it would return Mono.error, but here we just verify it exists
            }
            return responseSpec;
        });
        
        // Simulating the final error propagation
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.error(new RuntimeException("Network Glitch")));

        // 2. Act & Assert
        StepVerifier.create(geminiService.generateContent("Network failure test"))
                .expectError(AiProtocolException.class)
                .verify();
    }

    @Test
    void generateContent_ShouldFail_WhenJsonIsMalformed() throws JsonProcessingException {
        // 1. Arrange: JSON is valid but doesn't have the expected parts structure (triggers parse error)
        String mockResponseJson = "{ \"candidates\": [ { \"broken\": true } ] }";
        JsonNode mockJsonNode = objectMapper.readTree(mockResponseJson);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        // 2. Act & Assert
        StepVerifier.create(geminiService.generateContent("Broken path test"))
                .expectError(AiProtocolException.class)
                .verify();
    }
}
