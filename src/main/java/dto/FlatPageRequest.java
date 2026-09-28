package dto;

public record FlatPageRequest(
        int page,
        int size,
        String sort,
        String direction,
        String name,
        String furnish,
        String view,
        String houseName
) {
}
