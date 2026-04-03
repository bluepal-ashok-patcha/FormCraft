package com.formcraft.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.AiProtocolException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    @Mock
    private WebClient webClient;
    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;
    @Mock
    private WebClient.RequestBodySpec requestBodySpec;
    @Mock
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    private GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        geminiService = new GeminiService(webClient);
        
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        doReturn(requestHeadersSpec).when(requestBodyUriSpec).bodyValue(any());
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
    }

    @Test
    void generateContent_Success() throws Exception {
        String mockResponse = "{\"candidates\": [{\"content\": {\"parts\": [{\"text\": \"{\\\"regex\\\": \\\"abc\\\", \\\"errorMessage\\\": \\\"err\\\"}\"}]}}]}";
        JsonNode jsonNode = objectMapper.readTree(mockResponse);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(jsonNode));

        Mono<String> result = geminiService.generateContent("test");

        StepVerifier.create(result)
                .expectNext("{\"regex\": \"abc\", \"errorMessage\": \"err\"}")
                .verifyComplete();
    }

    @Test
    void generateFormBlueprint_Success() throws Exception {
        String mockResponse = "{\"candidates\": [{\"content\": {\"parts\": [{\"text\": \"[{\\\"id\\\": \\\"1\\\"}]\"}]}}]}";
        JsonNode jsonNode = objectMapper.readTree(mockResponse);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(jsonNode));

        Mono<String> result = geminiService.generateFormBlueprint("test", Collections.emptyList());

        StepVerifier.create(result)
                .expectNext("[{\"id\": \"1\"}]")
                .verifyComplete();
    }

    @Test
    void executeAiPulse_MissingCandidates_ShouldThrowException() throws Exception {
        String mockResponse = "{\"candidates\": []}";
        JsonNode jsonNode = objectMapper.readTree(mockResponse);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(jsonNode));

        Mono<String> result = geminiService.generateThemeBlueprint("test");

        StepVerifier.create(result)
                .expectError(AiProtocolException.class)
                .verify();
    }

    @Test
    void executeAiPulse_ParseError_ShouldThrowException() {
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.error(new RuntimeException("Bad JSON")));

        Mono<String> result = geminiService.generateContent("test");

        StepVerifier.create(result)
                .expectError(AiProtocolException.class)
                .verify();
    }
}
