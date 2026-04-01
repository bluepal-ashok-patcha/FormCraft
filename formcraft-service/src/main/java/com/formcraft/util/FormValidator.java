package com.formcraft.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class FormValidator {

    private final ObjectMapper objectMapper;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public void validate(Object schemaObject, Map<String, Object> responses) {
        try {
            JsonNode schemaNode = objectMapper.valueToTree(schemaObject);
            JsonNode fields = schemaNode.get("fields");

            if (fields == null || !fields.isArray()) {
                return;
            }

            for (JsonNode field : fields) {
                String id = field.has("id") ? field.get("id").asText() : field.get("label").asText();
                String label = field.get("label").asText();
                String type = field.get("type").asText();
                boolean required = field.has("required") && field.get("required").asBoolean();

                Object responseValue = responses.get(id);

                // 1. Check Required
                if (required && (responseValue == null || responseValue.toString().trim().isEmpty())) {
                    throw new BadRequestException("Field '" + label + "' is required.");
                }

                // 2. Complex Validation logic
                if (responseValue != null && !responseValue.toString().trim().isEmpty()) {
                    String valueStr = responseValue.toString();
                    
                    // Basic Type Validation
                    if ("number".equalsIgnoreCase(type)) {
                        try {
                            Double.parseDouble(valueStr);
                        } catch (NumberFormatException e) {
                            throw new BadRequestException("Field '" + label + "' must be a number.");
                        }
                    } else if ("email".equalsIgnoreCase(type)) {
                        if (!EMAIL_PATTERN.matcher(valueStr).matches()) {
                            throw new BadRequestException("Field '" + label + "' must be a valid email address.");
                        }
                    } else if ("file".equalsIgnoreCase(type)) {
                        if (!valueStr.startsWith("http")) {
                            throw new BadRequestException("Field '" + label + "' must contain a secure link to the attachment.");
                        }
                    }

                    // Advanced Validation Rules
                    if (field.has("validation")) {
                        JsonNode validation = field.get("validation");
                        
                        // Min/Max Length (for text)
                        if (validation.has("minLength") && valueStr.length() < validation.get("minLength").asInt()) {
                            throw new BadRequestException(validation.has("errorMessage") ? validation.get("errorMessage").asText() : "Field '" + label + "' must be at least " + validation.get("minLength").asInt() + " characters.");
                        }
                        if (validation.has("maxLength") && valueStr.length() > validation.get("maxLength").asInt()) {
                            throw new BadRequestException(validation.has("errorMessage") ? validation.get("errorMessage").asText() : "Field '" + label + "' cannot exceed " + validation.get("maxLength").asInt() + " characters.");
                        }

                        // Min/Max Value (for numbers)
                        if ("number".equalsIgnoreCase(type)) {
                            double numericValue = Double.parseDouble(valueStr);
                            if (validation.has("min") && numericValue < validation.get("min").asDouble()) {
                                throw new BadRequestException(validation.has("errorMessage") ? validation.get("errorMessage").asText() : "Field '" + label + "' must be at least " + validation.get("min").asDouble() + ".");
                            }
                            if (validation.has("max") && numericValue > validation.get("max").asDouble()) {
                                throw new BadRequestException(validation.has("errorMessage") ? validation.get("errorMessage").asText() : "Field '" + label + "' cannot exceed " + validation.get("max").asDouble() + ".");
                            }
                        }

                        // Regex validation
                        if (validation.has("regex") && !validation.get("regex").asText().isEmpty()) {
                            String regex = validation.get("regex").asText();
                            if (!Pattern.compile(regex).matcher(valueStr).matches()) {
                                throw new BadRequestException(validation.has("errorMessage") ? validation.get("errorMessage").asText() : "Field '" + label + "' has an invalid format.");
                            }
                        }
                    }
                }
            }
        } catch (BadRequestException e) {
            // Rethrow client errors directly
            throw e;
        } catch (Exception e) {
            log.error("Internal Audit [Critical]: Critical malfunction in the form validation engine.", e);
            throw new com.formcraft.exception.FormCraftException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred during form validation. Contact Support If issue persists.");
        }
    }
}
