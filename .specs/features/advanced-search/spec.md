# Technical Specification: Advanced Search (PostgreSQL Full-Text Search)

## 1. Overview
Transition the CifrAS search functionality from simple `ILIKE` filters to PostgreSQL Full-Text Search (FTS). This will provide improved relevance, performance, and robustness for title, artist, and lyrics search.

## 2. Database Migration (`tsvector`)
A new migration script will be created to:
- Add a generated column or index that combines `title`, `artist`, and `lyrics` content into a `tsvector`.
- Use `to_tsvector('portuguese', ...)` for proper language-specific stemming.
- Create a GIN index on the `tsvector` column for fast querying.

## 3. Backend Design
### 3.1. `SearchService`
An interface `SearchService` will be introduced to abstract the FTS implementation.
```java
public interface SearchService {
    List<Song> search(String query);
}
```
The implementation `PostgreSqlSearchService` will encapsulate the `tsquery` logic and ranking.

### 3.2. `SongRepository`
The `SongRepository` will be extended to support custom FTS queries:
- Add a method to execute a native SQL query for FTS.
- Implement ranking using `ts_rank` to prioritize matches in the `title` over `lyrics`.
- Keep the `Song` entity clean; repository logic handles the SQL-specific mapping.

## 4. Frontend & Performance
- **Quick Search Component:** A frontend component will be developed to handle search input with debounce to limit API calls.
- **Highlighting:** The backend will return matched snippets (using `ts_headline` if possible), and the frontend will highlight them.
- **Performance:** Ensure query execution time is <200ms by optimizing the GIN index and restricting the search scope.
