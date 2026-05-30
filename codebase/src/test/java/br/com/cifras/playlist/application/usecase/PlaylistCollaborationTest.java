package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import br.com.cifras.group.application.usecase.GroupService;
import br.com.cifras.playlist.infra.persistence.entity.PlaylistEntity;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.song.infra.persistence.entity.SongEntity;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.SongService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T14: Collaborative PlaylistEntity authorization tests.
 * Tests: 3
 * 1. Member of the linked group CAN read a collaborative playlist.
 * 2. Member of the linked group CANNOT add songs to a collaborative playlist (read-only).
 * 3. Non-member CANNOT read or edit a collaborative playlist.
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class PlaylistCollaborationTest extends BaseIntegrationTest {

    @Inject
    PlaylistService playlistService;

    @Inject
    GroupService groupService;

    @Inject
    SongService songService;

    private static final String OWNER = "collab-owner-uuid";
    private static final String MEMBER = "collab-member-uuid";
    private static final String STRANGER = "collab-stranger-uuid";

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenGroupMemberReads_thenSuccess() {
        GroupEntity group = groupService.createGroup("Collab Band", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Collab Setlist", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        assertDoesNotThrow(() -> playlistService.getById(playlist.id, MEMBER),
            "GroupEntity member should be able to read a collaborative playlist");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenGroupMemberAddsSong_thenThrowsForbiddenException() {
        GroupEntity group = groupService.createGroup("Collab Band Edit", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Collab Setlist Edit", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        SongEntity song = songService.create(
            new CreateSongRequest("SongEntity 1", "Artist", "C", null), OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> playlistService.addSong(playlist.id, song.id, 0, MEMBER),
            "GroupEntity member must NOT be able to edit a collaborative playlist (read-only)");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenStrangerAccesses_thenThrowsForbiddenException() {
        GroupEntity group = groupService.createGroup("Exclusive Band", OWNER);

        PlaylistEntity playlist = playlistService.create(
            new CreatePlaylistRequest("Exclusive Setlist", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> playlistService.getById(playlist.id, STRANGER),
            "Stranger must NOT be able to read a collaborative playlist");
    }
}
