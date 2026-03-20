package com.formcraft.exception;
 
import com.formcraft.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
 
class GlobalExceptionHandlerTest {
 
    private MockMvc mockMvc;
 
    @RestController
    class ExceptionTriggerController {
        @GetMapping("/test/not-found")
        public void triggerNotFound() {
            throw new ResourceNotFoundException("Test asset not found.");
        }
 
        @GetMapping("/test/business-logic")
        public void triggerBusinessLogic() {
            throw new BusinessLogicException("Test strategy violation.");
        }
 
        @GetMapping("/test/ai-protocol")
        public void triggerAiProtocol() {
            throw new AiProtocolException("Test neural failure.");
        }
    }
 
    @BeforeEach
    void setUp() {
        // Standalone Protocol: Bypasses Spring context discovery to directly test the handler's neural logic mapping.
        mockMvc = MockMvcBuilders.standaloneSetup(new ExceptionTriggerController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }
 
    @Test
    void handleResourceNotFoundException_Returns404WithApiResponse() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Test asset not found.")));
    }
 
    @Test
    void handleBusinessLogicException_Returns422WithApiResponseAndPrefix() throws Exception {
        mockMvc.perform(get("/test/business-logic"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Strategic Conflict:")));
    }
 
    @Test
    void handleAiProtocolException_Returns503WithApiResponseAndPrefix() throws Exception {
        mockMvc.perform(get("/test/ai-protocol"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Neural Link Interrupted:")));
    }
}
