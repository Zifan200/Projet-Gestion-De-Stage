package org.example.service.dto.cv;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CvDownloadDTO {
    private String fileName;
    private String fileType;
    private byte[] data;
}