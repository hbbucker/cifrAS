package br.com.cifras.song.dto;

import br.com.cifras.song.domain.EnharmonicConvention;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Request DTO for transposing a song.
 * semitones must be in range [-11, 11].
 */
public record TransposeRequest(
    @Min(-11) @Max(11) int semitones,
    EnharmonicConvention convention
) {
    public TransposeRequest {
        if (convention == null) convention = EnharmonicConvention.SHARPS;
    }
}
