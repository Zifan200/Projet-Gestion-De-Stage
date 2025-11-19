package org.example.service.dto.entente;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.model.enums.PdfStatus;

@Getter
@Setter
@AllArgsConstructor
public class EntenteStagePdfDTO {
    private Long id;
    private byte[] pdfData;
    private PdfStatus status;
//    private InternshipApplicationResponseDTO application;
    private Long applicationId;
}