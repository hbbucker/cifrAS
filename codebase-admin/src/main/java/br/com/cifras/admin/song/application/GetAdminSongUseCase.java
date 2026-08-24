package br.com.cifras.admin.song.application;

import br.com.cifras.admin.shared.exception.ResourceNotFoundException;
import br.com.cifras.admin.song.dto.AdminSongDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.infra.mapper.AdminSongMapper;
import br.com.cifras.admin.song.infra.repository.AdminSongRepository;
import br.com.cifras.admin.song.model.AdminSong;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;

@ApplicationScoped
public class GetAdminSongUseCase {

    @Inject
    AdminSongRepository songRepository;

    @Inject
    AdminSongMapper songMapper;

    public AdminSongDTO execute(UUID id) {
        AdminSongEntity entity = songRepository.findByIdOptional(id)
            .orElseThrow(() -> new ResourceNotFoundException("Song not found: " + id));

        AdminSong domain = songMapper.toDomain(entity);
        return songMapper.toDTO(domain, null, null);
    }
}
