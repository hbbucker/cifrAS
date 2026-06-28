package br.com.cifras.song.model;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

/**
 * Represents a named section within a song (e.g. "Verse 1", "Chorus").
 */
@RegisterForReflection
public record Section(String label, List<Line> lines) {

    public Section withLines(List<Line> newLines) {
        return new Section(this.label, newLines);
    }
}
