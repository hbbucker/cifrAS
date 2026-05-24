package br.com.cifras.song.domain;

import java.util.List;

/**
 * Represents a named section within a song (e.g. "Verse 1", "Chorus").
 */
public record Section(String label, List<Line> lines) {

    public Section withLines(List<Line> newLines) {
        return new Section(this.label, newLines);
    }
}
