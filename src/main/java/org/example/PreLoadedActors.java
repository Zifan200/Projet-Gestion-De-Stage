package org.example;

import lombok.Getter;
import org.example.model.CV;
import org.example.model.Employer;
import org.example.model.Etudiant;
import org.example.model.auth.Role;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.CvRepository;
import org.example.service.*;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.employer.EmployerResponseDto;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.student.EtudiantDTO;
import org.springframework.context.ApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class PreLoadedActors {

    private static PreLoadedActors instance;
    private ApplicationContext context;
    private StudentService studentService;
    private EmployerService employerService;
    private CvRepository cvRepository;
    private InternshipOfferService internshipOfferService;
    private InternshipApplicationService internshipApplicationService;

    private final List<String> userFirstNames = List.of(new String[]{"Kassidy",
            "Cedrick", "Jaida", "Tomas", "Warren", "Danika", "Mollie", "Declan", "Tyquan", "Xzavier"});
    private final List<String> userLastNames = List.of(new String[]{"Arroyo", "Akin", "Stevenson", "Crow", "Rucker", "Graf", "Oh", "Ford", "Ivey"});

    private List<String> companyNames = List.of(new String[]{"Harbor & Finch", "Evermont Group", "Bluevale Industries", "Northline Solutions", "Silverstone Partners", "Marrowfield Holdings",
            "Orion Works", "Crestpoint Co.", "Redgate Enterprises", "Linden & Co.", "TechCorp"});

    private List<String> internshipTitles = List.of(new String[]{
            "Software Engineering Intern",
            "Frontend Developer Intern",
            "Backend Developer Intern",
            "Mobile App Development Intern",
            "Cybersecurity Analyst Intern",
            "Machine Learning Intern",
            "Cloud Infrastructure Intern",
            "UI/UX Design Intern",
            "DevOps Intern",
            "IT Systems Support Intern",
            "Embedded Systems Intern",
            "Game Engine Development Intern",
            "Blockchain Solutions Intern",
            "Augmented Reality (AR) Prototype Intern",
            "Quantum Computing Research Intern",
            "Natural Language Processing (NLP) Intern",
            "IoT Systems Integration Intern",
            "Automation & Robotics Intern",
            "Computer Vision Intern",
            "Data Pipeline Engineering Intern"
    });

    @Getter
    private List<EtudiantDTO> etudiants = new ArrayList<>();
    @Getter
    private List<EmployerDto> employers = new ArrayList<>();
    @Getter
    private List<InternshipOfferDto> offers = new ArrayList<>();

    private PreLoadedActors(ApplicationContext context) {
        studentService = context.getBean(StudentService.class);
        employerService = context.getBean(EmployerService.class);
        cvRepository = context.getBean(CvRepository.class);
        internshipOfferService = context.getBean(InternshipOfferService.class);
        internshipApplicationService = context.getBean(InternshipApplicationService.class);
    }

    public static PreLoadedActors getInstance(ApplicationContext context) {
        if (context == null) {
            throw new IllegalStateException("context is null");
        }
        if (instance == null) {
            instance = new PreLoadedActors(context);
            instance.context = context;
        }
        return instance;
    }

    public static <T> int getRandomIndex(List<T> list) {
        if (list == null || list.isEmpty()) {
            return -1; // Or throw an IllegalArgumentException, depending on desired behavior
        }

        Random random = new Random();
        return random.nextInt(list.size());
    }

    private String genFirstName() {
        int firstNameIndex = (int) getRandomIndex(userFirstNames);
        return userFirstNames.get(firstNameIndex);
    }

    private String genLastName() {
        int lastNameIndex = getRandomIndex(userLastNames);
        return userLastNames.get(lastNameIndex);
    }

    private String emailGen(String firstName, String lastName) {
        int randomIndex = (int) (Math.random() * (10000 + 1));
        return firstName + lastName + randomIndex + "@gmail.com";
    }

    private String genCompanyName() {
        int randomIndex = getRandomIndex(companyNames);
        return companyNames.get(randomIndex);
    }

    private String genOfferTitle() {
        int randomIndex = getRandomIndex(internshipTitles);
        return internshipTitles.get(randomIndex);
    }

    //student
    public List<EtudiantDTO> genStudents(int quantity) {
        for (int i = 0; i < quantity; i++) {
            String firstName = genFirstName();
            String lastName = genLastName();
            String email = emailGen(firstName, lastName);

            EtudiantDTO etudiant = EtudiantDTO.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .adresse("Pole nord")
                    .password("Test123!")
                    .phone("123-123-1234")
                    .program("Technique de l'informatique")
                    .role(Role.STUDENT)
                    .build();
            var saved = studentService.inscriptionEtudiant(etudiant);
            etudiants.add(saved);
        }
        return etudiants;
    }

    public void associateEmptyCvToStudent(EtudiantDTO studentDto, CV cv) {
        cv.setEtudiant(EtudiantDTO.toEntity(studentDto));
        cvRepository.save(cv);
    }

    public void associateEmptyCvToStudent(EtudiantDTO studentDto) {
        byte[] bytes = new byte[9];
        CV studentCV = CV.builder()
                .etudiant(EtudiantDTO.toEntity(studentDto))
                .data(bytes)
                .fileName(studentDto.getFirstName() + "_CV")
                .fileSize(1L)
                .fileType("pdf")
                .reason("")
                .uploadedAt(LocalDateTime.now())
                .status(ApprovalStatus.ACCEPTED)
                .build();
        cvRepository.save(studentCV);
    }

    //employer
    public List<EmployerDto> genEmployers(int quantity) {
        for (int i = 0; i < quantity; i++) {
            String firstName = genFirstName();
            String lastName = genLastName();
            String email = emailGen(firstName, lastName);
            String companyName = genCompanyName();
            EmployerDto employer = EmployerDto.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password("Test123!")
                    .enterpriseName(companyName)
                    .build();
            var saved = employerService.saveEmployer(employer);
            EmployerDto savedDTO =
                    EmployerDto.builder()
                            .firstName(saved.getFirstName())
                            .lastName(saved.getLastName())
                            .email(saved.getEmail())
                            .phone(saved.getPhone())
                            .since(saved.getSince())
                            .enterpriseName(saved.getEnterpriseName())
                            .build();
            employers.add(savedDTO);
        }
        return employers;
    }

    public float genSalary() {
        float min = 16.1f;
        float max = 25f;
        float range = max - min + 1;
        float result = (float) (Math.random() * range) + min;

        int decimals = 2;
        result = (float) (result * Math.pow(10, decimals));
        result = (float) Math.floor(result);

        return (float) (result / Math.pow(10, decimals));
    }


    public List<InternshipOfferDto> genInternshipOffers(int quantity) {
        if (employers.isEmpty()) {
            System.err.println("no employers to give offers to");
            return new ArrayList<>();
        }

        for (int i = 0; i < quantity; i++) {
            String employerEmail = employers.get(getRandomIndex(employers)).getEmail();
            InternshipOfferDto offer = InternshipOfferDto.builder()
                    .title(genOfferTitle())
                    .employerEmail(employerEmail)
                    .title(genOfferTitle())
                    .description("loremepsum")
                    .targetedProgramme("Informatique")
                    .status(ApprovalStatus.ACCEPTED)
                    .expirationDate(LocalDate.now().plusDays( 30 ))
                    .salary(genSalary())
                    .build();
            InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(employerEmail, offer);
            internshipOfferService.updateOfferStatus(savedOffer.getId(),ApprovalStatus.ACCEPTED,"");
            offers.add(offer);
        }
        return offers;
    }
}
