package org.example.service;

import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InternshipOfferServiceTest {

    @Mock
    private EmployerRepository employerRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;


    @Mock
    private InternshipOfferRepository internshipOfferRepository;
    @InjectMocks
    private InternshipOfferService internshipOfferService;

    private Employer buildEmployer() {
        return Employer.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();
    }

    private EmployerDto buildEmployerDto() {
        return EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();
    }

    private EmployerDto buildEmployerDto(Employer employer) {
        return EmployerDto.builder()
                .email(employer.getEmail())
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .password(employer.getPassword())
                .since(LocalDate.now())
                .enterpriseName(employer.getEnterpriseName())
                .build();
    }

    private InternshipOffer buildInternshipOffer(Employer employer, LocalDate offerPublishDateTime) {
        return InternshipOffer.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(employer)
                .publishedDate(offerPublishDateTime)
                .build();
    }

    private InternshipOfferDto buildInternshipOfferDto(LocalDate offerPublishDateTime) {
        return InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .publishedDate(offerPublishDateTime)
                .build();
    }

    @Test
    void createInternshipOffer_shouldSaveInternshipOffer() {
        //Arrange
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto();
        LocalDate offerPublishDateTime = LocalDate.now();
        InternshipOffer createdOffer = buildInternshipOffer(employer, offerPublishDateTime);

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(employer));
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenReturn(createdOffer);

        //Act
        InternshipOfferDto internshipOfferDto = buildInternshipOfferDto(offerPublishDateTime);
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertThat(savedOffer)
                .extracting(InternshipOfferResponseDto::getTitle, InternshipOfferResponseDto::getPublishedDate)
                .containsExactly("recherche Scratch Developer", offerPublishDateTime);

        verify(internshipOfferRepository).save(any(InternshipOffer.class));
        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
        assertSame(savedOffer.getPublishedDate(), offerPublishDateTime);
    }

    @Test
    void createInternshipOffer_shouldHaveReferenceToEmployer() {
        //Arrange
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto();
        LocalDate offerPublishDateTime = LocalDate.now();
        InternshipOffer createdOffer = buildInternshipOffer(employer, offerPublishDateTime);

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(employer));
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenReturn(createdOffer);

        //Act
        InternshipOfferDto internshipOfferDto = buildInternshipOfferDto(offerPublishDateTime);
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertNotNull(savedOffer.getEmployerEmail());
        assertTrue(savedOffer.getEmployerEmail().equalsIgnoreCase("test@google.com"));
        assertSame(savedOffer.getPublishedDate(), offerPublishDateTime);
        assertNotNull(employerRepository.findByCredentialsEmail("test@google.com"));
        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
    }

    @Test
    void createOfferWithMissingInformation_shouldNotSave() {
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto(employer);

        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .build();

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.empty());

        //Act/ Assert
        assertThatThrownBy(() -> internshipOfferService.saveInternshipOffer(employer.getEmail(), internshipOfferDto))
                .isInstanceOf(InvalidInternShipOffer.class);

        verify(internshipOfferRepository, never()).save(any());
    }
}
