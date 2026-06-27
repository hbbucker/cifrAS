package br.com.cifras.integration.application;

import jakarta.enterprise.context.ApplicationScoped;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Extracts plain text from DOCX (Office Open XML) files using only JDK classes.
 * <p>
 * A DOCX is a ZIP archive. This extractor opens the ZIP, locates
 * {@code word/document.xml}, parses it with the built-in JAXP DOM parser,
 * and concatenates all {@code <w:t>} text nodes (with line breaks between paragraphs).
 * <p>
 * Fully compatible with GraalVM native image — no Apache POI or any other
 * external library is required.
 */
@ApplicationScoped
public class DocxTextExtractor {

    private static final String WORD_NAMESPACE =
            "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    private static final String DOCUMENT_XML_ENTRY = "word/document.xml";

    /**
     * Extracts text from the given DOCX bytes.
     *
     * @param docxBytes raw bytes of a DOCX file (must be a valid ZIP)
     * @return extracted plain text; paragraphs separated by newlines
     * @throws IOException if {@code docxBytes} is not a valid ZIP or the XML cannot be parsed
     */
    public String extract(byte[] docxBytes) throws IOException {
        byte[] documentXmlBytes = findDocumentXml(docxBytes);
        if (documentXmlBytes == null) {
            return "";
        }
        return parseDocumentXml(documentXmlBytes);
    }

    /**
     * Walks through the ZIP entries and returns the raw bytes of {@code word/document.xml},
     * or {@code null} if the entry is not found.
     *
     * @throws IOException if the bytes do not represent a valid ZIP archive
     */
    private byte[] findDocumentXml(byte[] docxBytes) throws IOException {
        // A valid ZIP must start with the local-file-header signature 0x504B0304
        if (docxBytes.length < 4
                || docxBytes[0] != 0x50 || docxBytes[1] != 0x4B
                || docxBytes[2] != 0x03 || docxBytes[3] != 0x04) {
            throw new IOException("Not a valid ZIP/DOCX file: missing ZIP signature");
        }
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(docxBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (DOCUMENT_XML_ENTRY.equals(entry.getName())) {
                    return zis.readAllBytes();
                }
                zis.closeEntry();
            }
        }
        return null;
    }

    /**
     * Parses the {@code word/document.xml} bytes and concatenates all text nodes,
     * inserting a newline character between consecutive {@code <w:p>} paragraphs.
     */
    private String parseDocumentXml(byte[] xmlBytes) throws IOException {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            // Disable external entity processing for security
            dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
            dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
            dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(xmlBytes));

            NodeList paragraphs = doc.getElementsByTagNameNS(WORD_NAMESPACE, "p");
            StringBuilder sb = new StringBuilder();

            for (int i = 0; i < paragraphs.getLength(); i++) {
                Element para = (Element) paragraphs.item(i);
                String paraText = extractParagraphText(para);
                if (!paraText.isEmpty()) {
                    if (sb.length() > 0) {
                        sb.append('\n');
                    }
                    sb.append(paraText);
                }
            }

            return sb.toString();
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("Failed to parse word/document.xml: " + e.getMessage(), e);
        }
    }

    /**
     * Collects all {@code <w:t>} text content within a single paragraph element.
     */
    private String extractParagraphText(Element paragraph) {
        NodeList textNodes = paragraph.getElementsByTagNameNS(WORD_NAMESPACE, "t");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < textNodes.getLength(); i++) {
            Node textNode = textNodes.item(i);
            if (textNode.getTextContent() != null) {
                sb.append(textNode.getTextContent());
            }
        }
        return sb.toString();
    }
}
