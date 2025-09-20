package org.example.service;

import org.example.event.UserCreatedEvent;
import org.example.model.Employer;
import org.example.model.Etudiant;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.DuplicateUserException;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InternshipOfferTest {

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

        when(employerRepository.save(any(Employer.class)))
                .thenAnswer(invocation -> (Employer) invocation.getArgument(0));
        when(passwordEncoder.encode(employerDto.getPassword()))
                .thenReturn("encodedPassword123");
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenAnswer(invocation -> (InternshipOffer) invocation.getArgument(0));

        //Act
        EmployerResponseDto savedEmployer = employerService.saveEmployer(employerDto);
        LocalDateTime publishDateTime = LocalDateTime.now();
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.fromEmployerResponseDtoBuilder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(savedEmployer)
                .publishedDate(publishDateTime)
                .build();

        InternshipOfferResponseDto responseOffer =  internshipOfferService.createInternshipOffer(internshipOfferDto);

        //Assert

//        verify(internshipOfferRepository).findInternshipOfferByPublishedDate(publishDateTime);
        verify(internshipOfferRepository).save(any(InternshipOffer.class));
        //TODO:implement this line of code below
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

        //Act
        EmployerResponseDto savedEmployer = employerService.saveEmployer(employerDto);
        LocalDateTime publishDateTime = LocalDateTime.now();
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.fromEmployerResponseDtoBuilder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(savedEmployer)
                .publishedDate(publishDateTime)
                .build();

        InternshipOfferResponseDto responseOffer =  internshipOfferService.createInternshipOffer(internshipOfferDto);

        //Assert
        assertNotNull(responseOffer.getEmployer());
        assertNotNull(responseOffer);

        assertThat(savedEmployer)
                .extracting(EmployerResponseDto::getEmail, EmployerResponseDto::getFirstName, EmployerResponseDto::getLastName)
                .containsExactly("test@google.com", "Test Firstname", "Test LastName");

        assertThat(responseOffer)
                .extracting(InternshipOfferResponseDto::getTitle, InternshipOfferResponseDto::getPublishedDate)
                .containsExactly("recherche Scratch Developer", publishDateTime);

        assertSame("test@google.com", responseOffer.getEmployer().getEmail());
        //TODO:implement this line of code below
        // verify(eventPubl1isher).publishEvent(any(UserCreatedEvent.class));
    }
}
