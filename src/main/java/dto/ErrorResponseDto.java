package dto;

import java.util.List;

public record ErrorResponseDto(
        List<String> errors
) {
}
