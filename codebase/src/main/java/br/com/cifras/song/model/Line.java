package br.com.cifras.song.model;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

/**
 * Represents one line of a song section, containing the lyric text
 * and the chords positioned above it.
 */
@RegisterForReflection
public record Line(List<ChordPosition> chords, String text) {

    public Line withChords(List<ChordPosition> newChords) {
        return new Line(newChords, this.text);
    }
}
