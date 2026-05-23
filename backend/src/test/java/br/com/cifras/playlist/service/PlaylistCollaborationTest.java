package br.com.cifras.playlist.service;

import br.com.cifras.group.domain.Group;
import br.com.cifras.group.service.GroupService;
import br.com.cifras.playlist.domain.Playlist;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.song.domain.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.service.SongService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T14: Collaborative Playlist authorization tests.
 * Tests: 2
 * 1. Member of the linked group CAN add songs to a collaborative playlist.
 * 2. Non-member CANNOT add songs to a collaborative playlist.
 */
@QuarkusTest
class PlaylistCollaborationTest {

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
    void givenCollaborativePlaylist_whenGroupMemberAddsSong_thenSuccess() {
        Group group = groupService.createGroup("Collab Band", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Collab Setlist", true, group.id), OWNER);

        Song song = songService.create(
            new CreateSongRequest("Song 1", "Artist", "C", null), OWNER);

        assertDoesNotThrow(() -> playlistService.addSong(playlist.id, song.id, 0, MEMBER),
            "Group member should be able to add a song to a collaborative playlist");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenStrangerAddsSong_thenThrowsForbiddenException() {
        Group group = groupService.createGroup("Exclusive Band", OWNER);

        Playlist playlist = playlistService.create(
            new CreatePlaylistRequest("Exclusive Setlist", true, group.id), OWNER);

        Song song = songService.create(
            new CreateSongRequest("Song 2", "Artist", "C", null), OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> playlistService.addSong(playlist.id, song.id, 0, STRANGER),
            "Stranger must NOT be able to add a song to a collaborative playlist");
    }
}
