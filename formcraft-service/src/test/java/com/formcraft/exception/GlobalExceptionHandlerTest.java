package com.formcraft.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @RestController
    static class TestController {
        @GetMapping("/resource-not-found")
        void throwResourceNotFound() {
            throw new ResourceNotFoundException("Test resource not found");
        }

        @GetMapping("/bad-request")
        void throwBadRequest() {
            throw new BadRequestException("Test bad request");
        }

        @GetMapping("/business-logic")
        void throwBusinessLogic() {
            throw new BusinessLogicException("Test strategy violation");
        }

        @GetMapping("/ai-protocol")
        void throwAiProtocol() {
            throw new AiProtocolException("Test neural failure");
        }
    }

    @Test
    void handleResourceNotFoundException_Returns404WithApiResponse() throws Exception {
        mockMvc.perform(get("/resource-not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Test resource not found"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void handleBadRequestException_Returns400WithApiResponse() throws Exception {
        mockMvc.perform(get("/bad-request"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Test bad request"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void handleBusinessLogicException_Returns422WithApiResponseAndPrefix() throws Exception {
        mockMvc.perform(get("/business-logic"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message", containsString("Error: Test strategy violation")))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void handleAiProtocolException_Returns503WithApiResponseAndPrefix() throws Exception {
        mockMvc.perform(get("/ai-protocol"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message", containsString("AI Service Error: Test neural failure")))
                .andExpect(jsonPath("$.success").value(false));
    }
}
