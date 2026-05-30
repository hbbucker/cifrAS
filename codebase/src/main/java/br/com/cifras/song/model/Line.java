package br.com.cifras.song.model;

import java.util.List;

/**
 * Represents one line of a song section, containing the lyric text
 * and the chords positioned above it.
 */
public record Line(List<ChordPosition> chords, String text) {

    public Line withChords(List<ChordPosition> newChords) {
        return new Line(newChords, this.text);
    }
}
