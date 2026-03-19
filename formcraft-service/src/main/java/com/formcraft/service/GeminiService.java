package com.formcraft.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService(WebClient geminiWebClient) {
        this.webClient = geminiWebClient;
    }

    public Mono<String> generateContent(String userPrompt) {
        System.out.println("✦ AI Neural Request: " + userPrompt);

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
                .bodyToMono(String.class) // get raw JSON
                .flatMap(json -> {
                    try {
                        System.out.println("✦ AI Response Received: " + json);
                        JsonNode root = objectMapper.readTree(json);
                        
                        JsonNode candidates = root.path("candidates");
                        if (candidates.isMissingNode() || candidates.isEmpty()) {
                            return Mono.error(new RuntimeException("AI safety rejection."));
                        }

                        String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip backticks if AI adds them
                        rawText = rawText.replaceAll("^```json|```$", "").trim();
                        
                        JsonNode aiResult = objectMapper.readTree(rawText);
                        String regex = aiResult.path("regex").asText();
                        String errorMsg = aiResult.path("errorMessage").asText();

                        System.out.println("✦ Extracted AI Synergy - Regex: " + regex + " | Msg: " + errorMsg);
                        // Return as a JSON-like string for the controller to handle or map directly
                        return Mono.just(rawText); 
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Neural parsing failure: " + e.getMessage()));
                    }
                });
    }

    public Mono<String> generateFormBlueprint(String description, List<Map<String, Object>> currentFields) {
        System.out.println("✦ Neural Architecture Command: " + description);
        boolean isModification = currentFields != null && !currentFields.isEmpty();

        String fieldSchemaInfo = "Allowed types: text, number, email, dropdown, checkbox, radio, date, textarea, rating, linear-scale." +
                                 "\nJSON Structure: { \"id\": \"unique_string\", \"type\": \"type_name\", \"label\": \"String\", \"required\": boolean, \"placeholder\": \"String\", \"options\": [\"opt1\", \"opt2\"], \"max\": number, \"validation\": { \"regex\": \"...\", \"errorMessage\": \"...\" } }";

        String contextInfo = isModification 
            ? "\nCURRENT FIELDS: " + currentFields.toString() + "\nACTION: Modify this existing list based on the user's wish. You can ADD, REMOVE, or UPDATE fields. Return the FULL updated array."
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
                .bodyToMono(String.class)
                .flatMap(json -> {
                    try {
                        JsonNode root = objectMapper.readTree(json);
                        String rawJson = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();
                        // Strip backticks
                        rawJson = rawJson.replaceAll("^```json|```$", "").trim();
                        System.out.println("✦ AI Architecture Transformation: " + rawJson);
                        return Mono.just(rawJson);
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Synthesis failure: " + e.getMessage()));
                    }
                });
    }
}
