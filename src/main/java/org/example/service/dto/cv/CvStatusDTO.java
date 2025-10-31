package org.example.service.dto.cv;

import lombok.*;
import org.example.model.enums.ApprovalStatus;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CvStatusDTO {
    private ApprovalStatus status;
    private String reason;
}
