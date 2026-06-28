package br.com.cifras.integration.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record DriveFileDTO(String id, String name, String mimeType, String parentFolderName) {}
