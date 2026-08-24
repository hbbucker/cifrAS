package br.com.cifras.admin;

import br.com.cifras.admin.song.dto.AdminSongDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.infra.mapper.AdminSongMapper;
import br.com.cifras.admin.song.model.AdminSong;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class AdminSongMapperTest {

    private final AdminSongMapper mapper = new AdminSongMapper();

    @Test
    void shouldMapEntityToDomainAndDTO() {
        AdminSongEntity entity = new AdminSongEntity();
        entity.id = UUID.randomUUID();
        entity.userId = "user-123";
        entity.title = "Pais e Filhos";
        entity.artist = "Legião Urbana";
        entity.originalKey = "C";
        entity.isFavorite = true;
        entity.tags = List.of("rock", "mpb");
        entity.createdAt = Instant.now();
        entity.updatedAt = Instant.now();
        entity.deletedAt = null;

        AdminSong domain = mapper.toDomain(entity);
        assertNotNull(domain);
        assertEquals(entity.id, domain.getId());
        assertEquals("Pais e Filhos", domain.getTitle());
        assertEquals("Legião Urbana", domain.getArtist());
        assertFalse(domain.isDeleted());

        AdminSongDTO dto = mapper.toDTO(domain, "autor@cifras.com", "Autor Nome");
        assertNotNull(dto);
        assertEquals(domain.getId(), dto.id());
        assertEquals("autor@cifras.com", dto.authorEmail());
        assertEquals("Autor Nome", dto.authorName());
        assertFalse(dto.isDeleted());
    }

    @Test
    void shouldHandleDeletedSong() {
        AdminSongEntity entity = new AdminSongEntity();
        entity.id = UUID.randomUUID();
        entity.userId = "user-123";
        entity.title = "Tempo Perdido";
        entity.artist = "Legião Urbana";
        entity.deletedAt = Instant.now();

        AdminSong domain = mapper.toDomain(entity);
        assertNotNull(domain);
        assertTrue(domain.isDeleted());
    }
}
