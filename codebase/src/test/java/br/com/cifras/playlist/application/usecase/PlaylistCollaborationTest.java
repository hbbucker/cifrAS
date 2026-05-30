package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.application.usecase.GroupService;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.SongService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T14: Collaborative Playlist authorization tests.
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
        Group group = groupService.createGroup("Collab Band", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Collab Setlist", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        assertDoesNotThrow(() -> playlistService.getById(playlist.id, MEMBER),
            "Group member should be able to read a collaborative playlist");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenGroupMemberAddsSong_thenThrowsForbiddenException() {
        Group group = groupService.createGroup("Collab Band Edit", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Collab Setlist Edit", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        Song song = songService.create(
            new CreateSongRequest("Song 1", "Artist", "C", null), OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> playlistService.addSong(playlist.id, song.id, 0, MEMBER),
            "Group member must NOT be able to edit a collaborative playlist (read-only)");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenStrangerAccesses_thenThrowsForbiddenException() {
        Group group = groupService.createGroup("Exclusive Band", OWNER);

        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Exclusive Setlist", false, null), OWNER);
        groupService.linkPlaylist(group.id, playlist.id, OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> playlistService.getById(playlist.id, STRANGER),
            "Stranger must NOT be able to read a collaborative playlist");
    }
}
