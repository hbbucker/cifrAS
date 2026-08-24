package br.com.cifras.admin.song.application;

import br.com.cifras.admin.shared.exception.ResourceNotFoundException;
import br.com.cifras.admin.song.dto.AdminSongDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.infra.mapper.AdminSongMapper;
import br.com.cifras.admin.song.infra.repository.AdminSongRepository;
import br.com.cifras.admin.song.model.AdminSong;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class ModerateSongUseCase {

    @Inject
    AdminSongRepository songRepository;

    @Inject
    AdminSongMapper songMapper;

    @Transactional
    public AdminSongDTO softDelete(UUID id) {
        AdminSongEntity entity = songRepository.findByIdOptional(id)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found: " + id));

        entity.deletedAt = Instant.now();
        songRepository.persist(entity);

        AdminSong domain = songMapper.toDomain(entity);
        return songMapper.toDTO(domain, null, null);
    }

    @Transactional
    public AdminSongDTO restore(UUID id) {
        AdminSongEntity entity = songRepository.findByIdOptional(id)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found: " + id));

        entity.deletedAt = null;
        songRepository.persist(entity);

        AdminSong domain = songMapper.toDomain(entity);
        return songMapper.toDTO(domain, null, null);
    }

    @Transactional
    public void hardDelete(UUID id) {
        AdminSongEntity entity = songRepository.findByIdOptional(id)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found: " + id));

        songRepository.delete(entity);
    }
}
