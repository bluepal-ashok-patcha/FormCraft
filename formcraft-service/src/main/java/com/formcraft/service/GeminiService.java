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

    public GeminiService(WebClient geminiWebClient) {
        this.webClient = geminiWebClient;
    }

    public Mono<String> generateContent(String userPrompt) {
        log.info("Neural Request: Interrogating AI with prompt: {}", userPrompt);

        // Define a strict system instruction to return JSON
        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(
                        Map.of("text", "You are a specialized Regular Expression generator. Given a description, you MUST output a JSON object with exactly two fields: 'regex' and 'errorMessage'. RULES: 1. 'regex' must be the raw regex string. 2. 'errorMessage' must be a professional, concise error message for that rule. 3. NO markdown. 4. NO conversational text.")
                )
        );

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", userPrompt)
                                )
                        )
                )
        );

        return webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(httpStatus -> httpStatus.isError(), 
                        response -> response.bodyToMono(String.class)
                                .defaultIfEmpty("Neural Pulse Interrupt: No error body provided.")
                                .flatMap(errorBody -> Mono.error(new AiProtocolException("Neural Pulse Refusal: " + errorBody))))
                .bodyToMono(String.class) // get raw JSON
                .flatMap(json -> {
                    try {
                        log.debug("Neural Pulse: Payload successfully received from AI link.");
                        JsonNode root = objectMapper.readTree(json);
                        
                        JsonNode candidates = root.path("candidates");
                        if (candidates.isMissingNode() || candidates.isEmpty()) {
                            return Mono.error(new AiProtocolException("Neural Safety Intercept: AI declined to generate content."));
                        }

                        String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip backticks if AI adds them
                        rawText = rawText.replaceAll("^```json|```$", "").trim();
                        
                        JsonNode aiResult = objectMapper.readTree(rawText);
                        String regex = aiResult.path("regex").asText();
                        String errorMsg = aiResult.path("errorMessage").asText();

                        log.info("Synergy Extraction: Regex and messaging synthesized.");
                        // Return as a JSON-like string for the controller to handle or map directly
                        return Mono.just(rawText); 
                    } catch (Exception e) {
                        return Mono.error(new AiProtocolException("Neural Parsing Failure: " + e.getMessage()));
                    }
                });
    }

    public Mono<String> generateFormBlueprint(String description, List<Map<String, Object>> currentFields) {
        System.out.println("✦ Neural Architecture Command: " + description);
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

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", description)
                                )
                        )
                )
        );

        return webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(httpStatus -> httpStatus.isError(), 
                        response -> response.bodyToMono(String.class)
                                .defaultIfEmpty("Architecture Link Interrupt: No error body provided.")
                                .flatMap(errorBody -> Mono.error(new AiProtocolException("Architecture Request Refusal: " + errorBody))))
                .bodyToMono(String.class)
                .flatMap(json -> {
                    try {
                        JsonNode root = objectMapper.readTree(json);
                        String rawJson = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip backticks
                        rawJson = rawJson.replaceAll("^```json|```$", "").trim();
                        log.info("Architecture Transformation: Strategic blueprint synthesized.");
                        return Mono.just(rawJson);
                    } catch (Exception e) {
                        return Mono.error(new AiProtocolException("Architecture Synthesis Failure: " + e.getMessage()));
                    }
                });
    }

    public Mono<String> generateThemeBlueprint(String formTitle) {
        System.out.println("✦ AI Styling Request for: " + formTitle);

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(
                        Map.of("text", "You are a professional Creative Director. Recommend a cohesive theme for a form titled: " + formTitle + 
                                       "\nOutput ONLY a raw JSON object with: { \"themeColor\": \"#HEX\", \"backgroundColor\": \"#HEX\" }. " + 
                                       "\nRULES: 1. themeColor should be professional. 2. backgroundColor should be a very light, matching tint of the themeColor for accessibility. 3. NO conversational text.")
                )
        );

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", "Synthesize a premium design vibe.")
                                )
                        )
                )
        );

        return webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(httpStatus -> httpStatus.isError(), 
                        response -> response.bodyToMono(String.class)
                                .defaultIfEmpty("Styling Link Interrupt: No error body provided.")
                                .flatMap(errorBody -> Mono.error(new AiProtocolException("Styling Request Refusal: " + errorBody))))
                .bodyToMono(String.class)
                .flatMap(json -> {
                    try {
                        JsonNode root = objectMapper.readTree(json);
                        String rawJson = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip backticks
                        rawJson = rawJson.replaceAll("^```json|```$", "").trim();
                        log.info("Styling Pulse: Professional aesthetic synthesized.");
                        return Mono.just(rawJson);
                    } catch (Exception e) {
                        return Mono.error(new AiProtocolException("Styling Synthesis Failure: " + e.getMessage()));
                    }
                });
    }
}
