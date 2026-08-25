package br.com.cifras.admin.shared.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.List;

@RegisterForReflection
public record PagedResponseDTO<T>(
    List<T> items,
    long totalElements,
    int page,
    int pageSize,
    int totalPages
) {
    public static <T> PagedResponseDTO<T> of(List<T> items, long totalElements, int page, int pageSize) {
        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 1;
        return new PagedResponseDTO<>(items, totalElements, page, pageSize, totalPages);
    }
}
