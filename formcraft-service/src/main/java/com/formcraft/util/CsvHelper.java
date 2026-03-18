package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CsvHelper {
    public static byte[] responsesToCsv(List<FormResponse> responses, List<Map<String, Object>> fields) {
        StringBuilder csv = new StringBuilder();
        
        // Headers
        csv.append("Response ID,Date Submitted");
        for (Map<String, Object> field : fields) {
            String label = (String) field.get("label");
            csv.append(",\"").append(label.replace("\"", "\"\"")).append("\"");
        }
        csv.append("\n");

        // Rows
        for (FormResponse response : responses) {
            csv.append(response.getId()).append(",").append(response.getCreatedAt());
            
            Map<String, Object> responseData = response.getResponseData();
            for (Map<String, Object> field : fields) {
                String label = (String) field.get("label");
                Object value = responseData != null ? responseData.get(label) : null;
                
                String valStr = "";
                if (value != null) {
                    if (value instanceof List) {
                        valStr = ((List<?>) value).stream()
                                .map(Object::toString)
                                .collect(Collectors.joining("; "));
                    } else {
                        valStr = value.toString();
                    }
                }
                
                // Fix for Excel converting big numbers (like phone numbers) into scientific notation.
                // If it looks like a phone number or large numeric ID, prepend a tab to force text mode.
                if (valStr.matches("^\\+?[0-9\\s\\-()]{8,20}$") && valStr.matches(".*\\d.*")) {
                    // Prepend tab so excel treats as literal string
                    valStr = "\t" + valStr;
                }

                csv.append(",\"").append(valStr.replace("\"", "\"\"")).append("\"");
            }
            csv.append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
