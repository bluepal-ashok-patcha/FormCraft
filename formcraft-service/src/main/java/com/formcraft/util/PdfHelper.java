package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

/**
 * High-End PDF Generation Component.
 * Integrates Thymeleaf templates with OpenHTMLToPDF for professional visual reporting.
 */
@Component
public class PdfHelper {

    private final TemplateEngine templateEngine;

    public PdfHelper(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    /**
     * Generates a binary PDF report containing both Analytics Graphs and Raw Responses.
     */
    public byte[] generateFormReport(String formName, List<FormResponse> responses, Map<String, Object> analytics) {
        // 1. Prepare Thymeleaf Context (The Data Bridge)
        Context context = new Context();
        context.setVariable("formName", formName);
        context.setVariable("responses", responses);
        context.setVariable("analytics", analytics);

        // 2 & 3. Process Template and Render to PDF Stream
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            String html = templateEngine.process("form-report", context);
            renderToStream(html, os);
            return os.toByteArray();
        } catch (Exception e) {
            throw new com.formcraft.exception.BusinessLogicException("PDF Generation Protocol Failed: " + e.getMessage());
        }
    }

    /**
     * Isolated Rendering Logic to satisfy SonarQube single-invocation requirements.
     */
    private void renderToStream(String html, java.io.OutputStream os) throws java.io.IOException {
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(html, "/");
        builder.toStream(os);
        builder.run();
    }
}
