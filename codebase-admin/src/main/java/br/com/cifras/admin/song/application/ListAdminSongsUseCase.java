package br.com.cifras.admin.song.application;

import br.com.cifras.admin.shared.dto.PagedResponseDTO;
import br.com.cifras.admin.song.dto.AdminSongDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.infra.mapper.AdminSongMapper;
import br.com.cifras.admin.song.infra.repository.AdminSongRepository;
import br.com.cifras.admin.song.model.AdminSong;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class ListAdminSongsUseCase {

    @Inject
    AdminSongRepository songRepository;

    @Inject
    AdminSongMapper songMapper;

    public PagedResponseDTO<AdminSongDTO> execute(String search, Boolean showDeletedOnly, int page, int pageSize) {
        int safePage = Math.max(0, page);
        int safePageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 20;

        List<AdminSongEntity> entities = songRepository.findFiltered(search, showDeletedOnly, Page.of(safePage, safePageSize));
        long total = songRepository.countFiltered(search, showDeletedOnly);

        List<AdminSongDTO> dtos = entities.stream().map(entity -> {
            AdminSong domain = songMapper.toDomain(entity);
            return songMapper.toDTO(domain, null, null);
        }).toList();

        return PagedResponseDTO.of(dtos, total, safePage, safePageSize);
    }
}
