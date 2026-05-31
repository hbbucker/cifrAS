package br.com.cifras.song.application.usecase;

import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.playlist.infra.persistence.entity.PlaylistSongEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.UUID;

@ApplicationScoped
public class GetSongUseCase {

    @Inject
    SongRepository songRepository;

    public Song execute(UUID id, String userId) {
        Song song = songRepository.findActiveById(id)
            .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        if (!userId.equals(song.getUserId())) {
            long count = PlaylistSongEntity.count(
                "song.id = ?1 and playlist.isCollaborative = true and playlist.group.id in " +
                "(select gm.group.id from GroupMemberEntity gm where gm.userId = ?2)", id, userId);
            
            if (count == 0) {
                throw new NotFoundException("Song not found: " + id); // Don't leak existence to other users
            }
        }

        return song;
    }
}
