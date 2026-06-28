package br.com.cifras.song.model;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

/**
 * Root structure of a song's chord sheet, persisted as JSONB in PostgreSQL.
 *
 * JSON format:
 * {
 *   "sections": [
 *     {
 *       "label": "Verso 1",
 *       "lines": [
 *         {
 *           "chords": [{"chord": "Am", "position": 0}, {"chord": "E", "position": 12}],
 *           "text": "Letra da música..."
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
@RegisterForReflection
public record LyricsStructure(List<Section> sections) {

    public LyricsStructure withSections(List<Section> newSections) {
        return new LyricsStructure(newSections);
    }

    public static LyricsStructure empty() {
        return new LyricsStructure(List.of());
    }
}
