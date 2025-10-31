package org.example.service.dto.cv;

import lombok.*;
import org.example.model.CV;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CvResponseDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private ApprovalStatus status;
    private String reason;
    private  String firstName;
    private String lastName;

    public static CvResponseDTO fromEntity(CV cv) {
        return CvResponseDTO.builder()
                .id(cv.getId())
                .fileName(cv.getFileName())
                .fileType(cv.getFileType())
                .fileSize(cv.getFileSize())
                .uploadedAt(cv.getUploadedAt())
                .status(cv.getStatus())
                .reason(cv.getReason())
                .firstName(cv.getEtudiant().getFirstName())
                .lastName(cv.getEtudiant().getLastName())
                .build();
    }
}
