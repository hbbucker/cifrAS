package br.com.cifras.song.application.usecase;

import br.com.cifras.song.dto.PendingSongShareItemDTO;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.infra.persistence.repository.SongShareRepository;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.model.SongShare;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ListPendingSongSharesUseCase {

    @Inject
    SongShareRepository songShareRepository;

    @Inject
    SongRepository songRepository;

    public List<PendingSongShareItemDTO> execute(String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            return List.of();
        }

        List<SongShare> shares = songShareRepository.findPendingByInviteeEmail(currentUserEmail.trim());
        List<PendingSongShareItemDTO> result = new ArrayList<>();

        for (SongShare share : shares) {
            Optional<Song> songOpt = songRepository.findActiveById(share.getSongId());
            if (songOpt.isPresent()) {
                Song song = songOpt.get();
                result.add(new PendingSongShareItemDTO(
                    share.getId(),
                    share.getSongId(),
                    song.getTitle(),
                    song.getArtist(),
                    song.getOriginalKey(),
                    share.getInviterId(),
                    share.getInviteeEmail(),
                    share.getCreatedAt()
                ));
            }
        }

        return result;
    }
}
