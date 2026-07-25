# Spec: Collaborative Playlists & Sharing

## Overview
This feature introduces unique sharing links for playlists to drive product-led growth (PLG) by allowing bandmates to view the shared playlist and incentivizing sign-ups for advanced features (bulk transpose, theater mode with auto-scroll).

## Requirements

| ID | Requirement | Type |
|---|---|---|
| REQ-01 | Create a "Share" button for playlist owners that generates a unique, secure URL token for a given playlist. | Functional |
| REQ-02 | Anonymous users with the link can view the read-only playlist and the songs in it. | Functional |
| REQ-03 | Anonymous users with the link are prompted with a Sign-up Wall when attempting to use bulk transposition for the playlist. | Functional/UX |
| REQ-04 | Anonymous users with the link are prompted with a Sign-up Wall when attempting to use Auto-Scroll in Theater Mode. | Functional/UX |
| REQ-05 | Implement >= 95% test coverage for the link generation and permissions logic. | Non-Functional |
| REQ-06 | 100% green local tests (Unit, Integration, E2E via Playwright) before PR approval. | Non-Functional |
