package org.example.service.dto;

import lombok.*;
import org.example.model.CV;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CvResponseDTO {
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public static CvResponseDTO fromEntity(CV cv) {
        return CvResponseDTO.builder()
                .fileName(cv.getFileName())
                .fileType(cv.getFileType())
                .fileSize(cv.getFileSize())
                .uploadedAt(cv.getUploadedAt())
                .build();
    }
}
