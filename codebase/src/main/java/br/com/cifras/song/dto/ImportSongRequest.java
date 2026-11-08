package br.com.cifras.song.dto;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;
@RegisterForReflection
public record ImportSongRequest(@NotBlank String url) {}
