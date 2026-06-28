package br.com.cifras.song.model;

import io.quarkus.runtime.annotations.RegisterForReflection;

/**
 * Represents a chord at a specific character position within a line.
 */
@RegisterForReflection
public record ChordPosition(String chord, int position) {

    public ChordPosition withChord(String newChord) {
        return new ChordPosition(newChord, this.position);
    }
}
