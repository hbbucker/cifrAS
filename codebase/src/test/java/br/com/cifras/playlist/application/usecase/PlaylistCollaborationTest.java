package br.com.cifras.playlist.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.application.usecase.CreateGroupUseCase;
import br.com.cifras.group.application.usecase.AddGroupMemberUseCase;
import br.com.cifras.group.application.usecase.LinkGroupPlaylistUseCase;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.application.usecase.CreateSongUseCase;
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
    CreatePlaylistUseCase createPlaylistUseCase;

    @Inject
    GetPlaylistUseCase getPlaylistUseCase;

    @Inject
    AddSongToPlaylistUseCase addSongToPlaylistUseCase;

    @Inject
    CreateGroupUseCase createGroupUseCase;

    @Inject
    AddGroupMemberUseCase addGroupMemberUseCase;

    @Inject
    LinkGroupPlaylistUseCase linkGroupPlaylistUseCase;

    @Inject
    CreateSongUseCase createSongUseCase;

    private static final String OWNER = "collab-owner-uuid";
    private static final String MEMBER = "collab-member-uuid";
    private static final String STRANGER = "collab-stranger-uuid";

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenGroupMemberReads_thenSuccess() {
        Group group = createGroupUseCase.execute("Collab Band", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Collab Setlist", false, null), OWNER);
        linkGroupPlaylistUseCase.execute(group.getId(), playlist.getId(), OWNER);

        assertDoesNotThrow(() -> getPlaylistUseCase.execute(playlist.getId(), MEMBER),
            "Group member should be able to read a collaborative playlist");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenGroupMemberAddsSong_thenThrowsForbiddenException() {
        Group group = createGroupUseCase.execute("Collab Band Edit", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Collab Setlist Edit", false, null), OWNER);
        linkGroupPlaylistUseCase.execute(group.getId(), playlist.getId(), OWNER);

        Song song = createSongUseCase.execute(
            new CreateSongRequest("Song 1", "Artist", "C", null), OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> addSongToPlaylistUseCase.execute(playlist.getId(), song.getId(), 0, MEMBER),
            "Group member must NOT be able to edit a collaborative playlist (read-only)");
    }

    @Test
    @Transactional
    void givenCollaborativePlaylist_whenStrangerAccesses_thenThrowsForbiddenException() {
        Group group = createGroupUseCase.execute("Exclusive Band", OWNER);

        Playlist playlist = createPlaylistUseCase.execute(
            new CreatePlaylistRequest("Exclusive Setlist", false, null), OWNER);
        linkGroupPlaylistUseCase.execute(group.getId(), playlist.getId(), OWNER);

        assertThrows(br.com.cifras.shared.exception.ForbiddenException.class,
            () -> getPlaylistUseCase.execute(playlist.getId(), STRANGER),
            "Stranger must NOT be able to read a collaborative playlist");
    }
}
