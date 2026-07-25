# Advanced Search (PostgreSQL Full-Text Search) Specification

## Problem Statement

The current search functionality relies on simple `ILIKEa filters which are slow on large databases, do not handle typos well, and lack relevance ranking. Musicians often remember snippets of lyrics or just parts of an artist's name and need a robust search engine that can quickly find the right song even with partial information.

## Goals

- [ ] Transition from `ILIKE` search to PostgreSQL Full-Text Search (FTS).
- [ ] Provide sub-200ms search responses for a database of over 10,000 songs.
- [ ] Improve search relevance by prioritizing title matches over lyrics matches.

## Out of Scope

| Feature | Reason |
||||
-------------------
| ElasticSearch Integration | Too complex for current scale; PostgreSQL FTS meets all requirements without adding infrastructure overhead. |
| Fuzzy search/Typos correction | Initial phase focuses on stemming and full-text indexing. Typo correction may be evaluated later. |

---

## User Stories

### P1: Search by Content (Quick Search) ⮠ MVP

**User Story**: As a musician, I want to search for songs using snippets of lyrics, titles, or specific artist names so that I can find the right song even when I don't remember the exact title.

**Why P1**: This is the core functionality of the Advanced Search epic and replaces the legacy search method.

**Acceptance Criteria**:
1. WHEN the user types in the Quick Search bar THEN the system SHALL return matching songs in under 200ms.
2. WHEN a search matches the title THEN the system SHALL rank it higher than a match in the lyrics.
3. WHEN the search results are displayed THEN the system SHALL visually highlight the matched terms in the UI.

**Independent Test**: Can demo by typing a snippet of lyrics in the UI and observing the matched song appearing at the top with the snippet highlighted.

---

## Edge Cases

- WHEN the search query contains only stop words THEN the system SHALL handle it gracefully and return an empty result or prompt the user for more specific terms.
- WHEN the search query is very long (e.g., > 100 characters) THEN the system SHALL truncate or reject the query to prevent performance issues.
- WHEN the database is updating the `tsvector` columns during a bulk insert THEN the system SHALL continue to serve search results without locking the read operations.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|||||
------------------------------------------------
| SEARCH-01 | P1: Search by Content | Design | Pending |
| SEARCH-02 | P1: Result Highlighting | Design | Pending |
|SEARCH-03 | P1: Performance Constraints | Design | Pending |

**Coverage:** 3 total, 3 mapped to tasks, 0 unmapped

---

## Technical Details & Business Rules

### 1. Database Migration (`tsvector`)
- Add a generated column or use triggers to combine `title`, `artist`, and `lyrics` content into a `tsvector`.
- Use `to_tsvector('portuguese', ...)` for proper language-specific stemming.
- Create a GIN index on the `tsvector` column for fast querying.

### 2. Backend Design
- **`SearchService`**: An interface `SearchService` will abstract the FTS implementation.
  ```java
  public interface SearchService {
      List<Song> search(String query);
  }
  ```
- **`SongRepository`**: Extended to support custom FTS queries:
  - Add a method to execute a native SQL query for FTS.
  - Implement ranking using `ts_rank` to prioritize matches in the `title` over `lyrics`.
  - Keep the `Song` entity clean; repository logic handles the SQL-specific mapping.


### 3. Frontend Component
- **Quick Search UI**: The search input must use a debounce strategy to limit API calls (e.g., 300ms).
- **Highlighting**: Backend should return matched snippets (e.g., via `ts_headline`), and frontend highlights them.
  *(Note: Collaboration with Maya Rivers required for precise visual behavior of Quick Search).*

---

## Success Criteria

- [ ] Search results are returned in < 200ms for 10,000+ songs.
- [ ] Users can find songs by typing partial lyrics.
- [ ] Matched text is visually highlighted in the search results UI.
