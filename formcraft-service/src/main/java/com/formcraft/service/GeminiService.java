package com.formcraft.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.AiProtocolException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String MARKDOWN_JSON_PATTERN = "(^```json)|(```$)";

    public GeminiService(WebClient geminiWebClient) {
        this.webClient = geminiWebClient;
    }

    public Mono<String> generateContent(String userPrompt) {
        log.info("Neural Request: Interrogating AI with prompt: {}", userPrompt);

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(
                        Map.of("text", "You are a specialized Regular Expression generator. Given a description, you MUST output a JSON object with exactly two fields: 'regex' and 'errorMessage'. RULES: 1. 'regex' must be the raw regex string. 2. 'errorMessage' must be a professional, concise error message for that rule. 3. NO markdown. 4. NO conversational text.")
                )
        );

        return executeAiPulse(systemInstruction, userPrompt, "Neural Pulse");
    }

    public Mono<String> generateFormBlueprint(String description, List<Map<String, Object>> currentFields) {
        log.info("✦ Neural Architecture Command: {}", description);
        if (currentFields == null) {
            currentFields = java.util.Collections.emptyList();
        }
        boolean isModification = !currentFields.isEmpty();
        String currentFieldsStr = currentFields.isEmpty() ? "None" : currentFields.toString();

        String fieldSchemaInfo = "Allowed types: text, number, email, dropdown, checkbox, radio, date, textarea, rating, linear-scale." +
                                 "\nJSON Structure: { \"id\": \"unique_string\", \"type\": \"type_name\", \"label\": \"String\", \"required\": boolean, \"placeholder\": \"String\", \"options\": [\"opt1\", \"opt2\"], \"max\": number, \"validation\": { \"regex\": \"...\", \"errorMessage\": \"...\" } }";

        String contextInfo = isModification 
            ? "\nCURRENT FIELDS: " + currentFieldsStr + "\nACTION: Modify this existing list based on the user's wish. You can ADD, REMOVE, or UPDATE fields. Return the FULL updated array."
            : "\nACTION: Synthesize a completely new blueprint based on the description.";

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(
                        Map.of("text", "You are a professional UX Form Architect. " + contextInfo + "\nRULES: 1. Output ONLY a raw JSON array. 2. Use the following schema info: " + fieldSchemaInfo + " 3. Maintain consistent IDs for existing fields that were not modified. 4. NO conversational text.")
                )
        );

        return executeAiPulse(systemInstruction, description, "Architecture Transformation");
    }

    public Mono<String> generateThemeBlueprint(String formTitle) {
        log.info("✦ AI Styling Request for: {}", formTitle);

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(
                        Map.of("text", "You are a professional Creative Director. Recommend a cohesive theme for a form titled: " + formTitle + 
                                       "\nOutput ONLY a raw JSON object with: { \"themeColor\": \"#HEX\", \"backgroundColor\": \"#HEX\" }. " + 
                                       "\nRULES: 1. themeColor should be professional. 2. backgroundColor should be a very light, matching tint of the themeColor for accessibility. 3. NO conversational text.")
                )
        );

        return executeAiPulse(systemInstruction, "Synthesize a premium design vibe.", "Styling Pulse");
    }

    /**
     * Consolidates the repetitive AI communication and payload cleaning logic.
     * This minimizes duplication and ensures a consistent security/parsing protocol.
     */
    private Mono<String> executeAiPulse(Map<String, Object> systemInstruction, String userText, String protocolLabel) {
        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", userText)
                                )
                        )
                )
        );

        return webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(httpStatus -> httpStatus.isError(), 
                        response -> response.bodyToMono(String.class)
                                .defaultIfEmpty(protocolLabel + " Interrupt: No error body provided.")
                                .flatMap(errorBody -> Mono.error(new AiProtocolException(protocolLabel + " Refusal: " + errorBody))))
                .bodyToMono(String.class)
                .flatMap(json -> {
                    try {
                        JsonNode root = objectMapper.readTree(json);
                        JsonNode candidates = root.path("candidates");
                        
                        if (candidates.isMissingNode() || candidates.isEmpty()) {
                            return Mono.error(new AiProtocolException(protocolLabel + " Safety Intercept: AI declined to generate content."));
                        }

                        String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip markdown backticks
                        String cleanedText = rawText.replaceAll(MARKDOWN_JSON_PATTERN, "").trim();
                        
                        log.info("{}: Strategy synthesized successfully.", protocolLabel);
                        return Mono.just(cleanedText);
                    } catch (Exception e) {
                        log.error("{}: Data Transformation Failure: {}", protocolLabel, e.getMessage(), e);
                        return Mono.error(new AiProtocolException(protocolLabel + ": Transformation Failure: " + e.getMessage()));
                    }
                });
    }
}
