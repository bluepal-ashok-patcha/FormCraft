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
    private static final String FIELD_PREFIX = "Field '";
    private static final String MIN_LENGTH_KEY = "minLength";
    private static final String MAX_LENGTH_KEY = "maxLength";
    private static final String REGEX_KEY = "regex";
    private static final String ERROR_MSG_KEY = "errorMessage";

    public void validate(Object schemaObject, Map<String, Object> responses) {
        try {
            JsonNode schemaNode = objectMapper.valueToTree(schemaObject);
            JsonNode fields = schemaNode.get("fields");

            if (fields == null || !fields.isArray()) {
                return;
            }

            for (JsonNode field : fields) {
                validateSingleField(field, responses);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Internal Audit [Critical]: Critical malfunction in the form validation engine.", e);
            throw new com.formcraft.exception.FormCraftException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An unexpected error occurred during form validation. Contact Support If issue persists.");
        }
    }

    private void validateSingleField(JsonNode field, Map<String, Object> responses) {
        String id = field.has("id") ? field.get("id").asText() : field.get("label").asText();
        String label = field.get("label").asText();
        String type = field.get("type").asText();
        boolean required = field.has("required") && field.get("required").asBoolean();
        Object responseValue = responses.get(id);

        verifyMandatoryStatus(label, required, responseValue);

        if (responseValue != null && !responseValue.toString().trim().isEmpty()) {
            validateContent(field, label, type, responseValue.toString());
        }
    }

    private void verifyMandatoryStatus(String label, boolean required, Object value) {
        if (required && (value == null || value.toString().trim().isEmpty())) {
            throw new BadRequestException(FIELD_PREFIX + label + "' is required.");
        }
    }

    private void validateContent(JsonNode field, String label, String type, String valueStr) {
        validateTypeFormat(label, type, valueStr);

        if (field.has("validation")) {
            processValidationRules(field.get("validation"), label, type, valueStr);
        }
    }

    private void validateTypeFormat(String label, String type, String valueStr) {
        if ("number".equalsIgnoreCase(type)) {
            try {
                Double.parseDouble(valueStr);
            } catch (NumberFormatException e) {
                throw new BadRequestException(FIELD_PREFIX + label + "' must be a number.");
            }
        } else if ("email".equalsIgnoreCase(type) && !EMAIL_PATTERN.matcher(valueStr).matches()) {
            throw new BadRequestException(FIELD_PREFIX + label + "' must be a valid email address.");
        } else if ("file".equalsIgnoreCase(type) && !valueStr.startsWith("http")) {
            throw new BadRequestException(FIELD_PREFIX + label + "' must contain a secure link to the attachment.");
        }
    }

    private void processValidationRules(JsonNode validation, String label, String type, String valueStr) {
        validateLength(validation, label, valueStr);
        validateNumericRules(validation, label, type, valueStr);
        validateRegex(validation, label, valueStr);
    }

    private void validateLength(JsonNode validation, String label, String valueStr) {
        if (validation.has(MIN_LENGTH_KEY) && valueStr.length() < validation.get(MIN_LENGTH_KEY).asInt()) {
            String defaultMsg = FIELD_PREFIX + label + "' must be at least " + validation.get(MIN_LENGTH_KEY).asInt() + " characters.";
            throw new BadRequestException(resolveError(validation, defaultMsg));
        }
        if (validation.has(MAX_LENGTH_KEY) && valueStr.length() > validation.get(MAX_LENGTH_KEY).asInt()) {
            String defaultMsg = FIELD_PREFIX + label + "' cannot exceed " + validation.get(MAX_LENGTH_KEY).asInt() + " characters.";
            throw new BadRequestException(resolveError(validation, defaultMsg));
        }
    }

    private void validateNumericRules(JsonNode validation, String label, String type, String valueStr) {
        if (!"number".equalsIgnoreCase(type)) return;

        double numericValue = Double.parseDouble(valueStr);
        if (validation.has("min") && numericValue < validation.get("min").asDouble()) {
            String defaultMsg = FIELD_PREFIX + label + "' must be at least " + validation.get("min").asDouble() + ".";
            throw new BadRequestException(resolveError(validation, defaultMsg));
        }
        if (validation.has("max") && numericValue > validation.get("max").asDouble()) {
            String defaultMsg = FIELD_PREFIX + label + "' cannot exceed " + validation.get("max").asDouble() + ".";
            throw new BadRequestException(resolveError(validation, defaultMsg));
        }
    }

    private void validateRegex(JsonNode validation, String label, String valueStr) {
        if (validation.has(REGEX_KEY) && !validation.get(REGEX_KEY).asText().isEmpty()) {
            String patternStr = validation.get(REGEX_KEY).asText();
            if (!Pattern.compile(patternStr).matcher(valueStr).matches()) {
                String defaultMsg = FIELD_PREFIX + label + "' has an invalid format.";
                throw new BadRequestException(resolveError(validation, defaultMsg));
            }
        }
    }

    private String resolveError(JsonNode validation, String defaultMsg) {
        return validation.has(ERROR_MSG_KEY) ? validation.get(ERROR_MSG_KEY).asText() : defaultMsg;
    }
}
