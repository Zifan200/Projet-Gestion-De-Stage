package org.example.service.dto.entente;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntenteCreationResponseDTO {
    private Long id;
    private byte[] pdfData;
}

