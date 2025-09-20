package org.example.service;

import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InternshipOfferServiceTest {

    @Mock
    private EmployerRepository employerRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private EmployerService employerService;

    @Mock
    private InternshipOfferRepository internshipOfferRepository;
    @InjectMocks
    private InternshipOfferService internshipOfferService;


    //TODO: implement EmployerCreatedInternshipOfferEvent in service
    @Mock
    private ApplicationEventPublisher eventPublisher;


    @Test
    void createInternshipOffer_shouldSaveInternshipOffer(){
        //Arrange
        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();


        when(employerRepository.save(any(Employer.class))).thenAnswer(invocation -> (Employer) invocation.getArgument(0));
        when(passwordEncoder.encode(employerDto.getPassword())).thenReturn("encodedPassword123");
        when(internshipOfferRepository.save(any(InternshipOffer.class))).thenAnswer(invocation -> (InternshipOffer) invocation.getArgument(0));

        LocalDateTime offerPublishDateTime = LocalDateTime.now();
        //Act
        EmployerResponseDto savedEmployer = employerService.saveEmployer(employerDto);
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.fromEmployerResponseDtoBuilder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(savedEmployer)
                .publishedDate(offerPublishDateTime)
                .build();

        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertThat(savedOffer)
                .extracting(InternshipOfferResponseDto::getTitle, InternshipOfferResponseDto::getPublishedDate)
                .containsExactly("recherche Scratch Developer", offerPublishDateTime );

        verify(internshipOfferRepository).save(any(InternshipOffer.class));

        //TODO:implement this line of code below (related to events)
        // verify(eventPubl1isher).publishEvent(any(UserCreatedEvent.class));
    }

    //test publishing date is current time
    @Test
    void createInternshipOffer_shouldHaveReferenceToEmployer(){
        //Arrange
        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();

        when(employerRepository.save(any(Employer.class)))
                .thenAnswer(invocation -> (Employer) invocation.getArgument(0));
        when(passwordEncoder.encode(employerDto.getPassword()))
                .thenReturn("encodedPassword123");
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenAnswer(invocation -> (InternshipOffer) invocation.getArgument(0));

        LocalDateTime offerPublishDateTime = LocalDateTime.now();
        //Act
        EmployerResponseDto savedEmployer = employerService.saveEmployer(employerDto);
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.fromEmployerResponseDtoBuilder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(savedEmployer)
                .publishedDate(offerPublishDateTime)
                .build();

        InternshipOfferResponseDto savedOffer =  internshipOfferService.saveInternshipOffer(internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertNotNull(savedOffer.getEmployerEmail());

        assertTrue(savedOffer.getEmployerEmail().equalsIgnoreCase("test@google.com"));
        assertNotNull(employerRepository.findByCredentialsEmail("test@google.com"));

        //TODO:implement this line of code below
        // verify(eventPubl1isher).publishEvent(any(UserCreatedEvent.class));
    }

    @Test
    public void createOfferWithMissingInformation_shouldNotSave(){
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .build();

        assertThatThrownBy(() -> internshipOfferService.saveInternshipOffer(internshipOfferDto))
                .isInstanceOf(InvalidInternShipOffer.class);
        verify(internshipOfferRepository, never()).save(any());
    }
}
