package br.com.cifras.share.application;

import br.com.cifras.share.dto.ShareLinkCreateDTO;
import br.com.cifras.share.dto.ShareLinkResponseDTO;
import br.com.cifras.share.infra.ShareLinkEntity;
import br.com.cifras.share.infra.ShareLinkRepository;
import br.com.cifras.share.model.ShareLinkType;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.model.Song;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.lang.IllegalArgumentException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@ApplicationScoped
public class ShareLinkService {

    @Inject
    ShareLinkRepository repository;

    @Inject
    GroupRepository groupRepository;

    @Inject
    SongRepository songRepository;

    @Transactional
    public ShareLinkResponseDTO createShareLink(ShareLinkCreateDTO dto, String userId) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(5, ChronoUnit.DAYS);

        String resourceName = "";
        if (dto.type() == ShareLinkType.SONG) {
            Song song = songRepository.findActiveById(dto.resourceId())
                    .orElseThrow(() -> new NotFoundException("Song not found"));
            resourceName = song.getTitle();
        } else if (dto.type() == ShareLinkType.GROUP) {
            Group group = groupRepository.findById(dto.resourceId())
                    .orElseThrow(() -> new NotFoundException("Group not found"));
            if (!groupRepository.isOwnerOrAdmin(dto.resourceId(), userId)) {
                throw new IllegalArgumentException("Only admins can share group links");
            }
            resourceName = group.getName();
        }

        ShareLinkEntity entity = new ShareLinkEntity(token, dto.type(), dto.resourceId(), userId, expiresAt);
        repository.persist(entity);

        return new ShareLinkResponseDTO(
                token,
                entity.getType(),
                entity.getResourceId(),
                resourceName,
                "Usuário", // Podemos buscar o nome posteriormente
                expiresAt,
                "https://cifras.app/invite/" + token
        );
    }

    public ShareLinkResponseDTO getShareLink(String token) {
        ShareLinkEntity entity = repository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Share link not found"));

        if (entity.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Share link expired");
        }

        String resourceName = "";
        if (entity.getType() == ShareLinkType.SONG) {
            Song song = songRepository.findActiveById(entity.getResourceId())
                    .orElseThrow(() -> new NotFoundException("Song not found"));
            resourceName = song.getTitle();
        } else if (entity.getType() == ShareLinkType.GROUP) {
            Group group = groupRepository.findById(entity.getResourceId())
                    .orElseThrow(() -> new NotFoundException("Group not found"));
            resourceName = group.getName();
        }

        return new ShareLinkResponseDTO(
                entity.getToken(),
                entity.getType(),
                entity.getResourceId(),
                resourceName,
                "Usuário", 
                entity.getExpiresAt(),
                "https://cifras.app/invite/" + token
        );
    }

    @Transactional
    public void acceptShareLink(String token, String userId) {
        ShareLinkEntity entity = repository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Share link not found"));

        if (entity.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Share link expired");
        }

        if (entity.getType() == ShareLinkType.SONG) {
            Song originalSong = songRepository.findActiveById(entity.getResourceId())
                    .orElseThrow(() -> new NotFoundException("Original song not found"));
            Song clonedSong = Song.createCloneForUser(originalSong, userId);
            songRepository.persist(clonedSong);
        } else if (entity.getType() == ShareLinkType.GROUP) {
            if (!groupRepository.isMember(entity.getResourceId(), userId)) {
                Group group = groupRepository.findById(entity.getResourceId()).orElseThrow();
                GroupMember member = GroupMember.create(group, userId, GroupRole.MEMBER);
                groupRepository.persistMember(member);
            }
        }
    }
}
