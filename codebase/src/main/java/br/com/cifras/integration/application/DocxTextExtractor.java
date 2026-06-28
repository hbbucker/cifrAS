package br.com.cifras.integration.application;

import jakarta.enterprise.context.ApplicationScoped;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@ApplicationScoped
public class DocxTextExtractor {

    private static final String WORDPROCESSINGML_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    public String extract(byte[] docxBytes) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(docxBytes))) {
            ZipEntry entry;
            boolean documentXmlFound = false;
            
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    documentXmlFound = true;
                    return parseDocumentXml(zis);
                }
            }
            
            if (!documentXmlFound) {
                throw new IOException("Not a valid DOCX file (missing word/document.xml)");
            }
        }
        
        return "";
    }

    private String parseDocumentXml(ZipInputStream zis) throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            // zis will not be closed by builder.parse
            Document doc = builder.parse(new org.xml.sax.InputSource(zis));
            
            StringBuilder extractedText = new StringBuilder();
            
            NodeList paragraphs = doc.getElementsByTagNameNS(WORDPROCESSINGML_NS, "p");
            for (int i = 0; i < paragraphs.getLength(); i++) {
                org.w3c.dom.Node paragraph = paragraphs.item(i);
                
                NodeList textNodes = ((org.w3c.dom.Element) paragraph).getElementsByTagNameNS(WORDPROCESSINGML_NS, "t");
                for (int j = 0; j < textNodes.getLength(); j++) {
                    extractedText.append(textNodes.item(j).getTextContent());
                }
                extractedText.append("\n");
            }
            
            return extractedText.toString();
        } catch (Exception e) {
            throw new IOException("Failed to parse DOCX document XML", e);
        }
    }
}
