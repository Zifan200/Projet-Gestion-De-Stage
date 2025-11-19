import React, { useState, useEffect } from "react";
import { Modal } from "./modal.jsx";
import { useAssignmentStore } from "../../stores/assignmentStore.js";
import { toast } from "sonner";

export const AssignmentModal = ({ open, onClose, student, onSuccess }) => {
  const { professors, assignStudent, reassignStudent, loading } =
    useAssignmentStore();
  const [selectedProfessorId, setSelectedProfessorId] = useState("");

  useEffect(() => {
    if (open && student?.professorId) {
      setSelectedProfessorId(student.professorId);
    } else {
      setSelectedProfessorId("");
    }
  }, [open, student]);

  const handleSubmit = async () => {
    if (!selectedProfessorId) {
      toast.error("Veuillez sélectionner un professeur");
      return;
    }

    const professorId = Number(selectedProfessorId);

    try {
      if (student?.assignmentId) {
        await reassignStudent(student.assignmentId, professorId);
        toast.success("Étudiant réattribué avec succès");
      } else {
        await assignStudent(student.id, professorId);
        toast.success("Étudiant attribué avec succès");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error.message.includes("notification")) {
        toast.warning(
          "Attribution enregistrée mais la notification a échoué. Vous pouvez la renvoyer plus tard.",
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(
          `Erreur lors de l'attribution: ${error.message || "Erreur inconnue"}`,
        );
      }
    }
  };

  const availableProfessors = professors.filter((prof) => prof.available);

  const footer = (
    <>
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        disabled={loading}
      >
        Annuler
      </button>
      <button
        onClick={handleSubmit}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || !selectedProfessorId}
      >
        {loading ? "Traitement..." : "Confirmer"}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        student?.professorId
          ? `Réattribuer ${student?.firstName} ${student?.lastName}`
          : `Attribuer ${student?.firstName} ${student?.lastName}`
      }
      footer={footer}
      size="default"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Étudiant:</span>{" "}
            {student?.firstName} {student?.lastName}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Programme:</span>{" "}
            {student?.program || "Non spécifié"}
          </p>
          {student?.professorName && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Professeur actuel:</span>{" "}
              {student.professorName}
            </p>
          )}
        </div>

        {availableProfessors.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Aucun professeur disponible pour l'instant.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sélectionner un professeur
            </label>
            <select
              value={selectedProfessorId}
              onChange={(e) => setSelectedProfessorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">-- Choisir un professeur --</option>
              {availableProfessors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.firstName} {professor.lastName}{" "}
                  {professor.department && `- ${professor.department}`} (
                  {professor.assignedStudentsCount || 0} étudiants)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
};
