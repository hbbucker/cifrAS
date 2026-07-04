import os
import re

base_dir = "src/main/webui/src"

strings_to_replace = {
    # LandingPage
    "Get Started for Free": "landing.getStarted",
    "Go to Dashboard": "landing.goDashboard",
    "Sign Up": "landing.signUp",
    "Log in": "landing.login",
    "Dashboard": "landing.dashboard",
    "Learn More": "landing.learnMore",
    "Your ultimate": "landing.yourUltimate",
    "chord & repertoire": "landing.chordRepertoire",
    "manager.": "landing.manager",
    "Instant Transposition": "landing.instantTrans",
    "Change keys in seconds. Never struggle with complex chords during a gig or rehearsal again.": "landing.desc3",
    "Theater Mode": "landing.theaterMode",
    "Distraction-free, full-screen auto-scrolling view optimized for live stage performances.": "landing.desc4",
    "Collaborative Playlists": "landing.collab",
    "Create groups, share setlists with your bandmates, and keep everyone in sync effortlessly.": "landing.desc2",
    "CifrAS helps musicians manage, transpose, and organize their chord charts and setlists for live performances and rehearsals.": "landing.desc1",
    "© 2026 CifrAS. All rights reserved.": "landing.rights",
    "Privacy Policy": "landing.privacy",
    "Política de Privacidade": "landing.privacy",
    
    # Auth
    "Welcome to CifrAS": "auth.welcome",
    "Your modern chord & repertoire manager": "auth.subtitle",
    "Email": "auth.email",
    "Password": "auth.password",
    "Register": "auth.register",
    "Don't have an account?": "auth.noAccount",
    "Full Name": "auth.fullName",
    "Confirm Password": "auth.confirmPassword",
    "Create an Account": "auth.createAccount",
    "Already have an account?": "auth.hasAccount",

    # SongForm
    "Chords & Lyrics": "songForm.chordsLyrics",
    "Quebra": "songForm.quebra",
    "Import from Drive": "songForm.importDrive",
    "Title": "songForm.title",
    "Artist": "songForm.artist",
    "Tom": "songForm.tom",
    "Refrão": "songForm.refrao",
    "Separador": "songForm.separador",
    "Tablatura": "songForm.tablatura",

    # SongView
    "Preferences": "songView.preferences",
    "Perform": "songView.perform",
    "Auto-scroll Speed": "songView.autoScroll",
    "Use Eb": "songView.useEb",
    "Use Bb": "songView.useBb",

    # PlaylistView
    "Add Songs": "playlistView.addSongs",
    "No songs in this playlist": "playlistView.noSongs",
    "Add Song": "playlistView.addSong",
    "Loading songs...": "playlistView.loading",
    "Select songs to add to your playlist": "playlistView.selectSongs",
    "Start Theater Mode": "playlistView.startTheater",
    "Add songs from the library to build your repertoire.": "playlistView.addDesc",
    "Add": "playlistView.add",

    # SharedWithMe
    "No playlists shared with you yet.": "sharedWithMe.noPlaylists",
    "Shared with Me": "sharedWithMe.title",
    "Loading shared playlists...": "sharedWithMe.loading",

    # GroupsPage
    "Loading groups...": "groups.loadingGroups",
    "New Group": "groups.newGroup",
    "Create New Group": "groups.createNewGroup",
    "Groups": "groups.groups",
    "Invited to join": "groups.invitedToJoin",
    "declined your invitation to join": "groups.declinedInvitation",
    "Accept": "groups.accept",
    "Decline": "groups.decline",
    "Create": "groups.create",
    "Send Invite": "groups.sendInvite",
    "No groups found.": "groups.noGroups",
    "Dismiss": "groups.dismiss",
    "Declined Invitations": "groups.declinedInvitations",
    "Pending Invitations": "groups.pendingInvitations",
    "Invite to Group": "groups.inviteToGroup",
    "Cancel": "common.cancel",
    "Save": "common.save",

    # Modals / Cards / Buttons
    "Share Playlist": "group.sharePlaylist",
    "Shared Playlists": "group.sharedPlaylists",
    "Delete": "musicCard.delete",
    "Edit": "musicCard.edit",
    "Share": "musicCard.share",
    "Leave Group": "group.leave",
    "Invite Member": "group.invite",
    "A+": "theater.aPlus",
    "Fast": "theater.fast",
    "Slow": "theater.slow",
    "A-": "theater.aMinus",
    "Share a Playlist": "linkPlaylist.shareTitle",
    "Select one of your personal playlists to share with this group. Members will be able to view and play it.": "linkPlaylist.shareDesc",
    "No results found": "search.noResults",
    "Try Again": "errorState.tryAgain"
}

props_to_replace = {
    "Search songs, artists...": "search.placeholder",
    "Search by title or artist...": "playlistView.searchPlaceholder",
    "you@example.com": "auth.emailPlaceholder",
    "John Doe": "auth.namePlaceholder",
    "Song Title": "songForm.titlePlaceholder",
    "Artist Name": "songForm.artistPlaceholder",
    "[C]Hello [G]world... (Use os botões acima ou Ctrl+S para salvar)": "songForm.contentPlaceholder",
    "member@example.com": "groups.memberEmail",
    "Group Name": "groups.groupName",
    "Actions menu": "musicCard.actions",
    "Exit Theater": "theater.exit",
    "Fullscreen": "theater.fullscreen",
    "Decrease Font": "theater.decreaseFont",
    "Increase Font": "theater.increaseFont",
    "Transpose up": "transposePad.up",
    "Transpose down": "transposePad.down",
    "Edit Song": "songView.editSong",
    "Play in Theater Mode": "sharedWithMe.playTheater",
    "Move up": "playlistView.moveUp",
    "Move down": "playlistView.moveDown",
    "Remove from Group": "group.remove",
    "No shared playlists": "group.noSharedPlaylists",
    "No personal playlists": "linkPlaylist.noPlaylists",
    "Discard changes?": "songForm.discard"
}

def process_tsx_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content
    has_changes = False

    for txt, key in strings_to_replace.items():
        pattern = re.compile(r">(\s*)" + re.escape(txt) + r"(\s*)<")
        if pattern.search(content):
            content = pattern.sub(r">\1{t('" + key + r"')}\2<", content)
            has_changes = True
            
        pattern2 = re.compile(r"\{\s*[\"']" + re.escape(txt) + r"[\"']\s*\}")
        if pattern2.search(content):
            content = pattern2.sub(r"{t('" + key + r"')}", content)
            has_changes = True

    for txt, key in props_to_replace.items():
        pattern = re.compile(r"([a-zA-Z]+)=[\"']" + re.escape(txt) + r"[\"']")
        if pattern.search(content):
            content = pattern.sub(r"\1={t('" + key + "')}", content)
            has_changes = True

    if has_changes:
        if "useTranslation" not in content:
            if "import " in content:
                content = re.sub(r"^(import [^\n]+\n)", r"\1import { useTranslation } from 'react-i18next';\n", content, count=1)
            else:
                content = "import { useTranslation } from 'react-i18next';\n" + content
                
            # Regex anchored at the start of line to catch the MAIN component definition
            # ^export default function Name(
            # ^export function Name(
            # ^const Name : React.FC = (
            # ^const Name = (
            comp_pattern = re.compile(r"^(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|export\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|const\s+[A-Z][A-Za-z0-9_]*\s*:\s*React\.FC[^=]*=\s*(?:<[^>]*>\s*)?\([^)]*\)\s*=>\s*\{|const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{)", re.MULTILINE)
            
            match = comp_pattern.search(content)
            if match:
                insert_pos = match.end()
                content = content[:insert_pos] + "\n  const { t } = useTranslation();" + content[insert_pos:]
            else:
                print(f"Warning: Could not inject t in {filepath}")

        if content != original_content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filepath}")

for root, dirs, files in os.walk(base_dir):
    for name in files:
        if name.endswith(".tsx"):
            process_tsx_file(os.path.join(root, name))
