package com.formcraft.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Pattern;

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
                String label = field.get("label").asText();
                String type = field.get("type").asText();
                boolean required = field.has("required") && field.get("required").asBoolean();

                Object responseValue = responses.get(label);

                // 1. Check Required
                if (required && (responseValue == null || responseValue.toString().trim().isEmpty())) {
                    throw new BadRequestException("Field '" + label + "' is required.");
                }

                // 2. Type Specific Validation
                if (responseValue != null && !responseValue.toString().trim().isEmpty()) {
                    String valueStr = responseValue.toString();
                    
                    if ("email".equalsIgnoreCase(type)) {
                        if (!EMAIL_PATTERN.matcher(valueStr).matches()) {
                            throw new BadRequestException("Field '" + label + "' must be a valid email address.");
                        }
                    } else if ("number".equalsIgnoreCase(type)) {
                        try {
                            Double.parseDouble(valueStr);
                        } catch (NumberFormatException e) {
                            throw new BadRequestException("Field '" + label + "' must be a number.");
                        }
                    }
                }
            }
        } catch (Exception e) {
            if (e instanceof BadRequestException) throw (BadRequestException) e;
            throw new RuntimeException("Error during form validation: " + e.getMessage());
        }
    }
}
