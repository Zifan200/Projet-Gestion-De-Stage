package org.example.service.dto.internship;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OfferVisibilityDTO {
    @NotNull(message = "Visibility status is required")
    private Boolean visibleToStudents;
}
