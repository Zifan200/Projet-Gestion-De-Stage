import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignmentModal } from "./assignment-modal.jsx";
import { useAssignmentStore } from "../../stores/assignmentStore.js";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

vi.mock("../../stores/assignmentStore.js");

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AssignmentModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockAssignStudent = vi.fn();
  const mockReassignStudent = vi.fn();

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
      assignedStudentsCount: 2,
      department: "Techniques de l'informatique",
    },
    {
      id: 3,
      firstName: "Prof",
      lastName: "C",
      available: false,
      assignedStudentsCount: 5,
      department: "Génie électrique",
    },
  ];

  const mockStudent = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    program: "Computer Science",
    professorId: null,
  };

  const mockAssignedStudent = {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    program: "Engineering",
    professorId: 1,
    professorName: "Prof A",
    assignmentId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAssignmentStore.mockReturnValue({
      professors: mockProfessors,
      assignStudent: mockAssignStudent,
      reassignStudent: mockReassignStudent,
      loading: false,
    });
  });

  it("should render the modal when open", () => {
    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    expect(screen.getAllByText(/John Doe/)[0]).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  it("should not render the modal when closed", () => {
    render(
      <AssignmentModal
        open={false}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument();
  });

  it("should display only available professors in the select", () => {
    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(within(select).getByText(/Prof A/)).toBeInTheDocument();
    expect(within(select).getByText(/Prof B/)).toBeInTheDocument();
    expect(within(select).queryByText(/Prof C/)).not.toBeInTheDocument();
  });

  it("should show current professor for reassignment", () => {
    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockAssignedStudent}
      />,
    );

    expect(screen.getByText(/Professeur actuel:/)).toBeInTheDocument();
    expect(screen.getByText("Prof A")).toBeInTheDocument();
  });

  it("should show warning when no professors are available", () => {
    useAssignmentStore.mockReturnValue({
      professors: [mockProfessors[2]],
      assignStudent: mockAssignStudent,
      reassignStudent: mockReassignStudent,
      loading: false,
    });

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    expect(
      screen.getByText("Aucun professeur disponible pour l'instant."),
    ).toBeInTheDocument();
  });

  it("should call assignStudent when assigning a new professor", async () => {
    const user = userEvent.setup();
    mockAssignStudent.mockResolvedValue({ id: 1 });

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
        onSuccess={mockOnSuccess}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const confirmButton = screen.getByText("Confirmer");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockAssignStudent).toHaveBeenCalledWith(1, 1);
      expect(toast.success).toHaveBeenCalledWith(
        "Étudiant attribué avec succès",
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should call reassignStudent when reassigning a professor", async () => {
    const user = userEvent.setup();
    mockReassignStudent.mockResolvedValue({ id: 1 });

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockAssignedStudent}
        onSuccess={mockOnSuccess}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "2");

    const confirmButton = screen.getByText("Confirmer");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockReassignStudent).toHaveBeenCalledWith(1, 2);
      expect(toast.success).toHaveBeenCalledWith(
        "Étudiant réattribué avec succès",
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should handle assignment error", async () => {
    const user = userEvent.setup();
    const mockError = new Error("Assignment failed");
    mockAssignStudent.mockRejectedValue(mockError);

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const confirmButton = screen.getByText("Confirmer");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Erreur lors de l'attribution: Assignment failed",
      );
    });
  });

  it("should handle notification failure gracefully", async () => {
    const user = userEvent.setup();
    const mockError = new Error("notification failed");
    mockAssignStudent.mockRejectedValue(mockError);

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
        onSuccess={mockOnSuccess}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const confirmButton = screen.getByText("Confirmer");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        "Attribution enregistrée mais la notification a échoué. Vous pouvez la renvoyer plus tard.",
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should disable buttons when loading", () => {
    useAssignmentStore.mockReturnValue({
      professors: mockProfessors,
      assignStudent: mockAssignStudent,
      reassignStudent: mockReassignStudent,
      loading: true,
    });

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const confirmButton = screen.getByText("Traitement...");
    const cancelButton = screen.getByText("Annuler");

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should close modal when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should disable confirm button when no professor selected", () => {
    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const confirmButton = screen.getByText("Confirmer");
    expect(confirmButton).toBeDisabled();
  });

  it("should enable confirm button when professor is selected", async () => {
    const user = userEvent.setup();

    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockStudent}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const confirmButton = screen.getByText("Confirmer");
    expect(confirmButton).not.toBeDisabled();
  });

  it("should pre-select current professor when reassigning", () => {
    render(
      <AssignmentModal
        open={true}
        onClose={mockOnClose}
        student={mockAssignedStudent}
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select.value).toBe("1");
  });
});
