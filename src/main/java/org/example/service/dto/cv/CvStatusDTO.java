package org.example.service.dto.cv;

import lombok.*;
import org.example.model.enums.InternshipOfferStatus;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CvStatusDTO {
    private InternshipOfferStatus status;
    private String reason;
}
