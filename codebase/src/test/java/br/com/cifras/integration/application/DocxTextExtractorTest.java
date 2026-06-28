package br.com.cifras.integration.application;

import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class DocxTextExtractorTest {

    private final DocxTextExtractor extractor = new DocxTextExtractor();

    @Test
    void givenValidDocx_whenExtract_thenReturnsText() throws Exception {
        byte[] docx = createDocx("<w:p><w:r><w:t>Hello World</w:t></w:r></w:p>");
        String result = extractor.extract(docx);
        assertEquals("Hello World\n", result);
    }

    @Test
    void givenDocxWithMultipleParagraphs_whenExtract_thenReturnsAllText() throws Exception {
        byte[] docx = createDocx(
                "<w:p><w:r><w:t>First Paragraph</w:t></w:r></w:p>" +
                "<w:p><w:r><w:t>Second Paragraph</w:t></w:r></w:p>"
        );
        String result = extractor.extract(docx);
        assertEquals("First Paragraph\nSecond Paragraph\n", result);
    }

    @Test
    void givenDocxWithNoText_whenExtract_thenReturnsEmpty() throws Exception {
        byte[] docx = createDocx("<w:p></w:p>");
        String result = extractor.extract(docx);
        assertEquals("\n", result);
    }

    @Test
    void givenInvalidBytes_whenExtract_thenThrowsIOException() {
        byte[] invalid = "not a zip file".getBytes();
        assertThrows(IOException.class, () -> extractor.extract(invalid));
    }

    private byte[] createDocx(String bodyContent) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("word/document.xml"));
            String xml = "<?xml version='1.0'?>" +
                    "<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>" +
                    "<w:body>" + bodyContent + "</w:body>" +
                    "</w:document>";
            zos.write(xml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }
}
