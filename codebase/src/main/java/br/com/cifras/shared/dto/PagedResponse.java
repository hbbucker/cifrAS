package br.com.cifras.shared.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

/**
 * Generic paginated response wrapper.
 * All paginated LIST endpoints return this structure.
 *
 * @param <T> the type of items in the page
 */
@RegisterForReflection
public record PagedResponse<T>(
    List<T> items,
    long totalCount,
    int page,
    int size
) {
    public static <T> PagedResponse<T> of(List<T> items, long totalCount, int page, int size) {
        return new PagedResponse<>(items, totalCount, page, size);
    }
}
