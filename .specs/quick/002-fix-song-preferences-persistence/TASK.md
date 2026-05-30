# Fix: Persistent Song Preferences

## Problem Statement
The song parameters defined in the preferences menu (auto-scroll speed, use Bb, use Eb) are currently not being persisted. If the user navigates away or refreshes the page, the settings are lost.

## Goal
Ensure that the song-specific preferences are saved to the database whenever they are altered, and that they are loaded and applied automatically whenever the user opens the song in `/songs/{id}` or Theater Mode. 

## Requirements
- **Save on Change**: Whenever a user changes the auto-scroll speed, the "Usar Bb" toggle, or the "Usar Eb" toggle, the backend should be updated to save this preference specifically for that song.
- **Load on Open**: When loading a song on `/songs/{id}` or in Theater Mode, the application must query the database and initialize the song configuration state with the persisted parameters.
- **Persistence Scope**: These parameters should be linked to the song (or the relationship between the user and the song, depending on the data model, though the prompt suggests saving it "for the song"). Since it's user preferences, it should likely be stored per user per song or global for the song if the user is the owner. (Will need to clarify data model during implementation).

## Status
- [x] Verify backend endpoint/mutation to persist preferences (Already implemented).
- [x] Update frontend to safely handle null values and trigger save correctly on parameter change.
- [x] Update frontend to load and apply preferences on component mount.
