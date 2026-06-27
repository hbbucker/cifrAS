package br.com.cifras.integration.application;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DocxTextExtractor.
 * Pure JUnit 5 - no Quarkus context needed (native-compatible pure Java).
 */
class DocxTextExtractorTest {

    private final DocxTextExtractor extractor = new DocxTextExtractor();

    // --- Helper ---

    /**
     * Creates a minimal in-memory DOCX (ZIP) with word/document.xml.
     * Each string in paragraphs becomes a separate {@code <w:p>} containing a {@code <w:t>}.
     */
    private byte[] createDocx(String... paragraphs) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("word/document.xml"));

            StringBuilder body = new StringBuilder();
            body.append("<?xml version='1.0' encoding='UTF-8'?>");
            body.append("<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">");
            body.append("<w:body>");
            for (String para : paragraphs) {
                body.append("<w:p>");
                body.append("<w:r><w:t>").append(para).append("</w:t></w:r>");
                body.append("</w:p>");
            }
            body.append("</w:body></w:document>");

            zos.write(body.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    /**
     * Creates a minimal DOCX whose {@code word/document.xml} has no {@code <w:t>} elements.
     */
    private byte[] createDocxWithNoText() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("word/document.xml"));
            String xml = "<?xml version='1.0' encoding='UTF-8'?>" +
                    "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
                    "<w:body><w:p><w:r></w:r></w:p></w:body></w:document>";
            zos.write(xml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    // --- Tests ---

    @Test
    void givenValidDocx_whenExtract_thenReturnsText() throws Exception {
        byte[] docxBytes = createDocx("Texto Test");
        String result = extractor.extract(docxBytes);
        assertNotNull(result);
        assertTrue(result.contains("Texto Test"), "Expected 'Texto Test' in: " + result);
    }

    @Test
    void givenDocxWithMultipleParagraphs_whenExtract_thenReturnsAllText() throws Exception {
        byte[] docxBytes = createDocx("Parágrafo 1", "Parágrafo 2", "Parágrafo 3");
        String result = extractor.extract(docxBytes);
        assertTrue(result.contains("Parágrafo 1"), "Expected paragraph 1");
        assertTrue(result.contains("Parágrafo 2"), "Expected paragraph 2");
        assertTrue(result.contains("Parágrafo 3"), "Expected paragraph 3");
    }

    @Test
    void givenDocxWithNoText_whenExtract_thenReturnsEmpty() throws Exception {
        byte[] docxBytes = createDocxWithNoText();
        String result = extractor.extract(docxBytes);
        assertNotNull(result);
        assertTrue(result.isBlank(), "Expected empty/blank result, got: '" + result + "'");
    }

    @Test
    void givenInvalidBytes_whenExtract_thenThrowsIOException() {
        byte[] invalidBytes = "this is not a ZIP file at all".getBytes(StandardCharsets.UTF_8);
        assertThrows(IOException.class, () -> extractor.extract(invalidBytes),
                "Expected IOException for non-ZIP bytes");
    }
}
