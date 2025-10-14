package org.example.service.dto;


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