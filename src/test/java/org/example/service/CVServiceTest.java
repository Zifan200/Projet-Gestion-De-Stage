package org.example.service;

import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.CvRepository;
import org.example.repository.EtudiantRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.exception.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class CVServiceTest {
    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private CvRepository cvRepository;

    @InjectMocks
    private CVService cvService;

    @Test
    void addCv_shouldSaveCv() throws IOException {
        // Arrange
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getSize()).thenReturn(1024L);
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.getBytes()).thenReturn("dummy".getBytes());

        when(etudiantRepository.findByCredentialsEmail("student@mail.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.save(any(CV.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        CvResponseDTO response = cvService.addCv("student@mail.com", file);

        // Assert
        assertThat(response)
                .extracting(CvResponseDTO::getFileName, CvResponseDTO::getFileType, CvResponseDTO::getFileSize)
                .containsExactly("cv.pdf", "application/pdf", 1024L);
        verify(cvRepository).save(any(CV.class));
    }

    @Test
    void addCv_shouldThrowUserNotFound() throws IOException {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getSize()).thenReturn(1024L);

        when(etudiantRepository.findByCredentialsEmail("ghost@mail.com"))
                .thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> cvService.addCv("ghost@mail.com", file))
                .isInstanceOf(UserNotFoundException.class);

        verify(cvRepository, never()).save(any());
    }


    @Test
    void addCv_shouldThrowInvalidFileType() {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        // Act + Assert
        assertThatThrownBy(() -> cvService.addCv("student@mail.com", file))
                .isInstanceOf(InvalidFileFormatException.class);

    }

    @Test
    void addCv_shouldThrowFileTooLarge() {
        // Arrange
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getSize()).thenReturn(6 * 1024 * 1024L); // 6 Mo


        // Act + Assert
        assertThatThrownBy(() -> cvService.addCv(etudiant.getEmail(), file))
                .isInstanceOf(InvalidFileFormatException.class);
    }



    @Test
    void addCv_shouldThrowFileProcessingException() throws IOException {
        // Arrange
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getSize()).thenReturn(1024L);
        when(file.getBytes()).thenThrow(new IOException("fail"));

        when(etudiantRepository.findByCredentialsEmail("student@mail.com"))
                .thenReturn(Optional.of(etudiant));

        // Act + Assert
        assertThatThrownBy(() -> cvService.addCv("student@mail.com", file))
                .isInstanceOf(FileProcessingException.class);
    }

    @Test
    void downloadCv_shouldReturnCv() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .fileName("cv.pdf")
                .fileType("application/pdf")
                .fileSize(1024L)
                .uploadedAt(LocalDateTime.now())
                .data("dummy".getBytes())
                .build();

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

        CV result = cvService.downloadCv(1L, "student@mail.com");

        assertThat(result.getFileName()).isEqualTo("cv.pdf");
    }

    @Test
    void downloadCv_shouldThrowNotFound() {
        when(cvRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.downloadCv(1L, "student@mail.com"))
                .isInstanceOf(CvNotFoundException.class);
    }

    @Test
    void downloadCv_shouldThrowAccessDenied() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("owner@mail.com")
                .build();
        CV cv = CV.builder().id(1L).etudiant(etudiant).build();

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

        assertThatThrownBy(() -> cvService.downloadCv(1L, "wrong@mail.com"))
                .isInstanceOf(AccessDeniedException.class);
    }



    @Test
    void listMyCvs_shouldReturnList() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("owner@mail.com")
                .build();

        CV cv1 = CV.builder().id(1L).etudiant(etudiant).fileName("cv1.pdf").fileType("application/pdf").fileSize(123L).uploadedAt(LocalDateTime.now()).data("a".getBytes()).build();
        CV cv2 = CV.builder().id(2L).etudiant(etudiant).fileName("cv2.doc").fileType("application/msword").fileSize(456L).uploadedAt(LocalDateTime.now()).data("b".getBytes()).build();

        when(etudiantRepository.findByCredentialsEmail("student@mail.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findAllByEtudiantId(1L)).thenReturn(List.of(cv1, cv2));

        List<CvResponseDTO> result = cvService.listMyCvs("student@mail.com");

        assertThat(result.getFirst().getFileName()).isEqualTo("cv1.pdf");
    }

    @Test
    void listMyCvs_shouldThrowUserNotFound() {
        when(etudiantRepository.findByCredentialsEmail("ghost@mail.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.listMyCvs("ghost@mail.com"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void deleteCv_shouldDelete() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        CV cv = CV.builder().id(1L).etudiant(etudiant).build();

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

        cvService.deleteCv(1L, "student@mail.com");

        verify(cvRepository).delete(cv);
    }

    @Test
    void deleteCv_shouldThrowNotFound() {
        when(cvRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.deleteCv(1L, "student@mail.com"))
                .isInstanceOf(CvNotFoundException.class);
    }

    @Test
    void deleteCv_shouldThrowAccessDenied() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("owner@mail.com")
                .build();
        CV cv = CV.builder().id(1L).etudiant(etudiant).build();

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

        assertThatThrownBy(() -> cvService.deleteCv(1L, "student@mail.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void approveCv_shouldApprove() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        CV cv = CV.builder().id(1L).etudiant(etudiant).build();
        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CvResponseDTO response = cvService.approveCv(1L);

        assertThat(response.getStatus()).isEqualTo(InternshipOfferStatus.ACCEPTED);
        assertThat(cv.getStatus()).isEqualTo(InternshipOfferStatus.ACCEPTED);

        verify(cvRepository).findById(1L);
        verify(cvRepository).save(cv);
    }

    @Test
    void rejectCv_shouldReject() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        CV cv = CV.builder().id(1L).etudiant(etudiant).build();
        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CvResponseDTO response = cvService.refuseCv(1L, "Le CV est insuffisant.");

        assertThat(response.getStatus()).isEqualTo(InternshipOfferStatus.REJECTED);
        assertThat(cv.getStatus()).isEqualTo(InternshipOfferStatus.REJECTED);

        verify(cvRepository).findById(1L);
        verify(cvRepository).save(cv);
    }


    @Test
    void updateCv_shouldModify() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("student@mail.com")
                .build();

        CV cv = CV.builder().id(1L).etudiant(etudiant).build();
        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

        cvService.approveCv(1L);
        CvResponseDTO response = cvService.updateCvStatus(1L, InternshipOfferStatus.REJECTED,
                                                    "Contenu insuffisant.");

        assertThat(response.getStatus()).isEqualTo(InternshipOfferStatus.REJECTED);
        assertThat(cv.getStatus()).isEqualTo(InternshipOfferStatus.REJECTED);

        verify(cvRepository, times(2)).findById(1L);
        verify(cvRepository, times(2)).save(cv);
    }

    @Test
    void updateCv_shouldThrowInvalid() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("owner@mail.com")
                .build();

        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .build();

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

        cvService.approveCv(1L);

        assertThatThrownBy(() -> cvService.updateCvStatus(1L, InternshipOfferStatus.ACCEPTED, null))
                .isInstanceOf(InvalidInternShipOffer.class);
    }

    @Test
    void updateCv_shouldThrowNotFound() {
        Etudiant etudiant = Etudiant.builder()
                .id(1L)
                .email("owner@mail.com")
                .build();

        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .build();


        when(cvRepository.findById(cv.getId() + 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.updateCvStatus(2L, InternshipOfferStatus.ACCEPTED, null))
                    .isInstanceOf(CvNotFoundException.class);
    }
}