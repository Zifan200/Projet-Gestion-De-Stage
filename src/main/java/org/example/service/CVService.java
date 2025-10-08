package org.example.service;


import lombok.AllArgsConstructor;
import lombok.Builder;
import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.CvRepository;
import org.example.repository.EtudiantRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.CvDownloadDTO;
import org.example.service.dto.CvResponseDTO;
import org.example.service.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Service
public class CVService {
    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final Logger logger = LoggerFactory.getLogger(CVService.class);
    private final UserAppService userAppService;
    private final EtudiantRepository studentRepository;
    private final CvRepository cvRepository;

    public CvResponseDTO addCv(String email, MultipartFile cvFile) {
        validateFile(cvFile);

        Etudiant student = studentRepository
                .findByCredentialsEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + email));


        try {
            CV cv = CV.builder()
                    .etudiant(student)
                    .fileName(cvFile.getOriginalFilename())
                    .fileType(cvFile.getContentType())
                    .fileSize(cvFile.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .data(cvFile.getBytes())
                    .status(InternshipOfferStatus.PENDING)
                    .build();

            cvRepository.save(cv);

            return CvResponseDTO.fromEntity(cv);

        } catch (IOException e) {
            throw new FileProcessingException("Impossible de lire le fichier", e);
        }
    }

    public CV downloadCv(Long cvId, String email) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV introuvable avec id " + cvId));

        if (!cv.getEtudiant().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Vous n'avez pas le droit d'accéder à ce CV");
        }

        return cv;
    }

    public List<CvResponseDTO> listMyCvs(String email) {
        Etudiant etudiant = studentRepository.findByCredentialsEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + email));

        return cvRepository.findAllByEtudiantId(etudiant.getId())
                .stream()
                .map(CvResponseDTO::fromEntity)
                .toList();
    }

    public void deleteCv(Long cvId, String email) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV introuvable avec id " + cvId));

        if (!cv.getEtudiant().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Vous n'avez pas le droit de supprimer ce CV");
        }

        cvRepository.delete(cv);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileFormatException("Aucun fichier fourni.");
        }

        List<String> allowedTypes = List.of(
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        if (!allowedTypes.contains(file.getContentType())) {
            throw new InvalidFileFormatException("Seuls les fichiers PDF ou Word (.doc/.docx) sont acceptés.");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new InvalidFileFormatException("Le fichier dépasse la taille maximale de 5 Mo.");
        }
    }

    public List<CvResponseDTO> listAllCvs() {
        List <CV> allCvs = cvRepository.findAll();

        return allCvs.stream()
                .map(CvResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public CvResponseDTO updateCvStatus(Long cvId, InternshipOfferStatus newStatus, String reason) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV introuvable. Veuillez réessayer."));

        if (cv.getStatus() == newStatus) {
            throw new InvalidInternShipOffer("Le CV possède déjà le statut " + newStatus + ".");
        }

        cv.setStatus(newStatus);

        if (newStatus == InternshipOfferStatus.REJECTED) {
            cv.setReason(reason);
        }
        else {
            cv.setReason(reason);
        }

        if (newStatus == InternshipOfferStatus.REJECTED && (reason == null || reason.isEmpty())) {
            throw new InvalidInternShipOffer("Vous devez spécifier la raison du refus.");
        }

        CV updatedCv = cvRepository.save(cv);
        return CvResponseDTO.fromEntity(updatedCv);
    }

    @Transactional
    public CvResponseDTO approveCv(Long cvId) {
        return updateCvStatus(cvId, InternshipOfferStatus.ACCEPTED, null);
    }

    @Transactional
    public CvResponseDTO refuseCv(Long cvId, String reason) {
        return updateCvStatus(cvId, InternshipOfferStatus.REJECTED, reason);
    }

    @Transactional(readOnly = true)
    public CvDownloadDTO downloadCvById(Long cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV introuvable avec id " + cvId));

        if (cv.getData() == null || cv.getData().length == 0) {
            throw new FileProcessingException("Aucun contenu trouvé pour ce CV.");
        }

        return CvDownloadDTO.builder()
                .fileName(cv.getFileName())
                .fileType(cv.getFileType())
                .data(cv.getData())
                .build();
    }
}
