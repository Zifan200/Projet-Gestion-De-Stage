package org.example.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.model.enums.PdfStatus;

@Entity
@Getter
@Setter
@NoArgsConstructor

public class EntenteStagePdf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private byte[] pdfData;

    @Enumerated(EnumType.STRING)
    private PdfStatus status;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private InternshipApplication application;
}
