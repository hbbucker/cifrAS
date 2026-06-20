package br.com.cifras.config;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection(targets = {
    // Shared DTOs
    br.com.cifras.shared.dto.PagedResponse.class,
    
    // Song DTOs
    br.com.cifras.song.dto.SongSummaryDTO.class,
    br.com.cifras.song.dto.UpdateSongRequest.class,
    br.com.cifras.song.dto.CreateSongRequest.class,
    br.com.cifras.song.dto.TransposeRequest.class,
    br.com.cifras.song.dto.SongDTO.class,
    br.com.cifras.song.model.LyricsStructure.class,
    br.com.cifras.song.model.MusicalKey.class,
    br.com.cifras.song.model.Line.class,
    br.com.cifras.song.model.ChordPosition.class,
    br.com.cifras.song.model.Section.class,
    br.com.cifras.song.model.EnharmonicConvention.class,
    
    // Playlist DTOs
    br.com.cifras.playlist.dto.PlaylistSongDTO.class,
    br.com.cifras.playlist.dto.ReorderRequest.class,
    br.com.cifras.playlist.dto.AddSongRequest.class,
    br.com.cifras.playlist.dto.CreatePlaylistRequest.class,
    br.com.cifras.playlist.dto.PlaylistDTO.class,
    br.com.cifras.playlist.dto.PlaylistDetailsDTO.class,
    
    // Group DTOs
    br.com.cifras.group.dto.CreateGroupRequest.class,
    br.com.cifras.group.dto.GroupDTO.class,
    br.com.cifras.group.dto.AddMemberRequest.class,
    br.com.cifras.group.dto.LinkPlaylistRequest.class,
    br.com.cifras.group.dto.GroupInvitationDTO.class,
    
    // Auth DTOs
    br.com.cifras.auth.dto.AuthRequest.class
})
public class NativeReflectionConfig {
    // This class is purely used to hint GraalVM native-image compiler 
    // to keep these classes and their fields available for Jackson Reflection at runtime.
}
