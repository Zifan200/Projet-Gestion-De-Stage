import { render, screen, within} from "@testing-library/react";
import { GsInternshipAgreements } from "./agreements.jsx";
import useGeStore from "../../stores/geStore.js";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

vi.mock("../../stores/geStore.js")

describe("tests GsInternshipAgreements", () => {
    const mockLoadInternshipApplication = vi.fn();

    const mockInternshipApplicationData = [
        {
            "id": 1,
            "studentEmail": "emi@test.com",
            "studentFirstName": "Émile",
            "studentLastName": "Étudiant",
            "studentProgrammeName": "Technique de l'informatique",
            "internshipOfferId": 1,
            "internshipOfferTitle": "Frontend React",
            "internshipOfferDescription": "Lorem ipsum",
            "internshipOfferPublishedDate": "2025-11-18",
            "internshipOfferExpirationDate": "2026-01-18",
            "employerEmail": "jane@employeur.com",
            "employerFirstName": "Jane",
            "employerLastName": "Smith",
            "employerEnterpriseName": "InfoSoft",
            "employerAddress": "111 rue Principale",
            "salary": 17.50,
            "typeHoraire": "FULL_TIME",
            "nbHeures": 40.0,
            "address": "123 rue Principale",
            "etudiantStatus": "CONFIRMED_BY_STUDENT",
            "postInterviewStatus": "ACCEPTED",
            "createdAt": "2025-11-18T18:20:45.717452",
            "startDate": "2025-02-15",
            "endDate": "2025-05-15",
            "session": "Hiver",
            "claimed": false,
            "claimedBy": null,
            "ententeStagePdfId": null
        },
        {
            "id": 2,
            "studentEmail": "sam@test.com",
            "studentFirstName": "Samantha",
            "studentLastName": "Student",
            "studentProgrammeName": "Technique de l'informatique",
            "internshipOfferId": 1,
            "internshipOfferTitle": "Java SpringBoot",
            "internshipOfferDescription": "Lorem ipsum",
            "internshipOfferPublishedDate": "2025-11-18",
            "internshipOfferExpirationDate": "2026-01-18",
            "employerEmail": "jane@employeur.com",
            "employerFirstName": "Jane",
            "employerLastName": "Smith",
            "employerEnterpriseName": "Company Inc.",
            "employerAddress": "111 rue Principale",
            "salary": 17.50,
            "typeHoraire": "FULL_TIME",
            "nbHeures": 40.0,
            "address": "123 rue Principale",
            "etudiantStatus": "CONFIRMED_BY_STUDENT",
            "postInterviewStatus": "ACCEPTED",
            "createdAt": "2025-11-18T18:20:45.717452",
            "startDate": "2025-02-15",
            "endDate": "2025-05-15",
            "session": "Hiver",
            "claimed": true,
            "claimedBy": 1,
            "ententeStagePdfId": 1
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useGeStore.mockReturnValue({
            applications: mockInternshipApplicationData,
            loadAllInternshipApplications: mockLoadInternshipApplication,
            loading: false,
        });
    });

    it("should display the page title correctly", () => {
        render(<GsInternshipAgreements />);
        expect(screen.getByText("title")).toBeInTheDocument();
    });

    it("should load the internship applications properly", () => {
        render(<GsInternshipAgreements />);
        expect(mockLoadInternshipApplication).toHaveBeenCalledTimes(1);
    });

    it("should display the internship application's informations in the table", () => {
        render(<GsInternshipAgreements />);
        expect(screen.getByText("Frontend React")).toBeInTheDocument();
        expect(screen.getByText("InfoSoft")).toBeInTheDocument();
        expect(screen.getByText("Émile Étudiant")).toBeInTheDocument();
    });

    it("should display the view details button for every internship application", () => {
        render(<GsInternshipAgreements />);

        const tableRows = screen.getAllByRole("row");
        const row1 = tableRows.find((row) => row.textContent.includes("Émile Étudiant"));
        const row2 = tableRows.find((row) => row.textContent.includes("Samantha Student"));
        const viewButton1 = within(row1).getByText("table.actionView");
        const viewButton2 = within(row2).getByText("table.actionView");

        expect(viewButton1).toBeInTheDocument();
        expect(viewButton2).toBeInTheDocument();
    });

    it("should display the create agreement button for applications that don't have an agreement", () => {
        render(<GsInternshipAgreements />);

        const tableRows = screen.getAllByRole("row");
        const noAgreementRow = tableRows.find((row) => row.textContent.includes("Émile Étudiant"));
        const createAgreementButton = within(noAgreementRow).getByText("table.createAgreement");

        expect(createAgreementButton).toBeInTheDocument();
    });

    it("should display the view agreement and download buttons for applications that have an agreement", () => {
        render(<GsInternshipAgreements />);

        const tableRows = screen.getAllByRole("row");
        const withAgreementRow = tableRows.find((row) => row.textContent.includes("Samantha Student"));
        const viewAgreementButton = within(withAgreementRow).getByText("table.viewAgreement");
        const downloadButton = within(withAgreementRow).getByText("table.download");

        expect(viewAgreementButton).toBeInTheDocument();
        expect(downloadButton).toBeInTheDocument();
    });
});