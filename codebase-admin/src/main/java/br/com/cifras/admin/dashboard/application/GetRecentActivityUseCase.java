package br.com.cifras.admin.dashboard.application;

import br.com.cifras.admin.dashboard.dto.RecentActivityDTO;
import br.com.cifras.admin.song.infra.entity.AdminSongEntity;
import br.com.cifras.admin.song.infra.repository.AdminSongRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class GetRecentActivityUseCase {

    @Inject
    AdminSongRepository songRepository;

    public List<RecentActivityDTO> execute(int limit) {
        List<AdminSongEntity> recentSongs = songRepository.findRecent(limit);
        List<RecentActivityDTO> activities = new ArrayList<>();

        for (AdminSongEntity song : recentSongs) {
            String type = song.deletedAt != null ? "SONG_DELETED" : "SONG_CREATED";
            String description = song.deletedAt != null 
                ? "Música arquivada: " + song.title + " - " + song.artist
                : "Nova cifra cadastrada: " + song.title + " - " + song.artist;

            activities.add(new RecentActivityDTO(
                song.id.toString(),
                type,
                song.title + " (" + song.artist + ")",
                description,
                song.userId,
                song.updatedAt != null ? song.updatedAt : song.createdAt
            ));
        }

        return activities;
    }
}
