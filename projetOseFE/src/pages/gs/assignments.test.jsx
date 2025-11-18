import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GsAssignments } from "./assignments.jsx";
import { useAssignmentStore } from "../../stores/assignmentStore.js";
import userEvent from "@testing-library/user-event";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../stores/assignmentStore.js");

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GsAssignments", () => {
  const mockLoadStudents = vi.fn();
  const mockLoadProfessors = vi.fn();
  const mockRetryNotification = vi.fn();

  const mockStudents = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      program: "Computer Science",
      professorId: null,
      assignmentId: null,
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@test.com",
      program: "Engineering",
      professorId: 1,
      assignmentId: 1,
    },
  ];

  const mockProfessors = [
    {
      id: 1,
      firstName: "Prof",
      lastName: "A",
      available: true,
      assignedStudentsCount: 1,
      department: "Techniques de l'informatique",
    },
    {
      id: 2,
      firstName: "Prof",
      lastName: "B",
      available: true,
      assignedStudentsCount: 0,
      department: "Techniques de l'informatique",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAssignmentStore.mockReturnValue({
      students: mockStudents,
      professors: mockProfessors,
      loadStudents: mockLoadStudents,
      loadProfessors: mockLoadProfessors,
      retryNotification: mockRetryNotification,
      loading: false,
    });
  });

  it("should render the assignments page", () => {
    render(<GsAssignments />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("should load students and professors on mount", () => {
    render(<GsAssignments />);
    expect(mockLoadStudents).toHaveBeenCalledTimes(1);
    expect(mockLoadProfessors).toHaveBeenCalledTimes(1);
  });

  it("should display students in the table", () => {
    render(<GsAssignments />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  it("should show unassigned status for students without professors", () => {
    render(<GsAssignments />);

    const rows = screen.getAllByRole("row");
    const johnRow = rows.find((row) => row.textContent.includes("John Doe"));

    expect(within(johnRow).getByText("status.unassigned")).toBeInTheDocument();
  });

  it("should show assigned status for students with professors", () => {
    render(<GsAssignments />);

    const rows = screen.getAllByRole("row");
    const janeRow = rows.find((row) => row.textContent.includes("Jane Smith"));

    expect(within(janeRow).getByText("status.assigned")).toBeInTheDocument();
  });

  it("should display professor name for assigned students", () => {
    render(<GsAssignments />);

    expect(screen.getByText("Prof A")).toBeInTheDocument();
  });

  it("should display no professor text for unassigned students", () => {
    render(<GsAssignments />);

    expect(screen.getByText("noProfessor")).toBeInTheDocument();
  });

  it("should show assign button for unassigned students", () => {
    render(<GsAssignments />);

    const rows = screen.getAllByRole("row");
    const johnRow = rows.find((row) => row.textContent.includes("John Doe"));
    const assignButton = within(johnRow).getByText("actions.assign");

    expect(assignButton).toBeInTheDocument();
  });

  it("should show reassign button for assigned students", () => {
    render(<GsAssignments />);

    const rows = screen.getAllByRole("row");
    const janeRow = rows.find((row) => row.textContent.includes("Jane Smith"));
    const reassignButton = within(janeRow).getByText("actions.reassign");

    expect(reassignButton).toBeInTheDocument();
  });

  it("should open assignment modal when assign button is clicked", async () => {
    const user = userEvent.setup();
    render(<GsAssignments />);

    const rows = screen.getAllByRole("row");
    const johnRow = rows.find((row) => row.textContent.includes("John Doe"));
    const assignButton = within(johnRow).getByText("actions.assign");

    await user.click(assignButton);

    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/)[0]).toBeInTheDocument();
    });
  });

  it("should filter students by status", async () => {
    const user = userEvent.setup();
    render(<GsAssignments />);

    const filterButton = screen.getByText(/filter.status/);
    await user.click(filterButton);

    const assignedOption = screen.getByRole("button", {
      name: "status.assigned",
    });
    await user.click(assignedOption);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  it("should show warning when no professors are available", () => {
    useAssignmentStore.mockReturnValue({
      students: mockStudents,
      professors: [],
      loadStudents: mockLoadStudents,
      loadProfessors: mockLoadProfessors,
      retryNotification: mockRetryNotification,
      loading: false,
    });

    render(<GsAssignments />);

    expect(screen.getByText("noProfessorsAvailable")).toBeInTheDocument();
  });

  it("should show retry notification button when notification failed", () => {
    const studentsWithFailedNotification = [
      {
        ...mockStudents[1],
        notificationFailed: true,
      },
    ];

    useAssignmentStore.mockReturnValue({
      students: studentsWithFailedNotification,
      professors: mockProfessors,
      loadStudents: mockLoadStudents,
      loadProfessors: mockLoadProfessors,
      retryNotification: mockRetryNotification,
      loading: false,
    });

    render(<GsAssignments />);

    expect(
      screen.getByText("actions.retryNotification"),
    ).toBeInTheDocument();
  });

  it("should call retryNotification when retry button is clicked", async () => {
    const user = userEvent.setup();
    const studentsWithFailedNotification = [
      {
        ...mockStudents[1],
        notificationFailed: true,
      },
    ];

    useAssignmentStore.mockReturnValue({
      students: studentsWithFailedNotification,
      professors: mockProfessors,
      loadStudents: mockLoadStudents,
      loadProfessors: mockLoadProfessors,
      retryNotification: mockRetryNotification,
      loading: false,
    });

    render(<GsAssignments />);

    const retryButton = screen.getByText("actions.retryNotification");
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRetryNotification).toHaveBeenCalledWith(1);
    });
  });

  it("should display empty message when no students exist", () => {
    useAssignmentStore.mockReturnValue({
      students: [],
      professors: mockProfessors,
      loadStudents: mockLoadStudents,
      loadProfessors: mockLoadProfessors,
      retryNotification: mockRetryNotification,
      loading: false,
    });

    render(<GsAssignments />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });
});
