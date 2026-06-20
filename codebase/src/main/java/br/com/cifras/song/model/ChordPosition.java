package br.com.cifras.song.model;

/**
 * Represents a chord at a specific character position within a line.
 */
public record ChordPosition(String chord, int position) {

    public ChordPosition withChord(String newChord) {
        return new ChordPosition(newChord, this.position);
    }
}
