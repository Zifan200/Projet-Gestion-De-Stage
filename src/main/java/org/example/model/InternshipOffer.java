package org.example.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Getter
@Setter
@ToString
public class InternshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String description;
    @Column(name = "target_programme")
    private String targetedProgramme;

    @ManyToOne
    @JoinColumn(name = "employer_id", referencedColumnName = "id")
    private Employer employer;

    private LocalDate publishedDate =  LocalDate.now();
    private LocalDate expirationDate;
    private boolean attachmentPresent = false;
    //optional single file upload for the offer (simpler with one file 🙏)
    @Column(name = "file_name")
    private String fileName;
    @Column(name = "file_type")
    private String fileType;
    @Column(name = "file_size")
    private Long fileSize;
    @Lob
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "file_data")
    private byte[] fileData;


    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targetedProgramme, Employer employer,
            LocalDate publishedDate, LocalDate expirationDate,boolean attachmentPresent,  String fileName, String fileType, Long fileSize, byte[] fileData
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.attachmentPresent = attachmentPresent;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileData = fileData;
    }
}
