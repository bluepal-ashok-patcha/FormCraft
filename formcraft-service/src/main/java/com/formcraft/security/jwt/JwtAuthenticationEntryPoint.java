package com.formcraft.security.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        response.setContentType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Check for specific diagnostic hints from the Filter
        String message = (String) request.getAttribute("jwt_exception");
        if (message == null) {
            message = authException.getMessage() != null ? authException.getMessage() : "Unauthorized access rejected";
        }

        com.formcraft.dto.response.ApiResponse<Object> apiResponse = com.formcraft.dto.response.ApiResponse.error(
            "Security Link Severed: " + message
        );

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.writeValue(response.getOutputStream(), apiResponse);
    }
}
