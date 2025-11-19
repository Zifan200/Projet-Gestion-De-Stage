import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { AssignmentModal } from "../../components/ui/assignment-modal.jsx";
import { useAssignmentStore } from "../../stores/assignmentStore.js";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";
import { PersonIcon, CheckIcon } from "@radix-ui/react-icons";

export const GsAssignments = () => {
  const { t } = useTranslation("gs_dashboard_assignments");
  const {
    students,
    professors,
    loadStudents,
    loadProfessors,
    retryNotification,
    loading,
  } = useAssignmentStore();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    loadStudents();
    loadProfessors();
  }, []);

  const sortedAndFilteredStudents = useMemo(() => {
    const order = { unassigned: 1, assigned: 2 };
    const filtered = filterStatus
      ? students.filter((student) => {
          const isAssigned = student.professorId !== null;
          return filterStatus === "assigned" ? isAssigned : !isAssigned;
        })
      : students;
    return [...filtered].sort((a, b) => {
      const aStatus = a.professorId ? "assigned" : "unassigned";
      const bStatus = b.professorId ? "assigned" : "unassigned";
      return order[aStatus] - order[bStatus];
    });
  }, [students, filterStatus]);

  const handleAssign = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleRetryNotification = async (assignmentId) => {
    try {
      await retryNotification(assignmentId);
      toast.success(t("toast.notificationRetried"));
    } catch {
      toast.error(t("toast.notificationRetryError"));
    }
  };

  const getStatusColor = (hasAssignment) => {
    return hasAssignment
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const rows = sortedAndFilteredStudents.map((student) => {
    const professor = student.professorId
      ? professors.find((p) => p.id === student.professorId)
      : null;

    const professorName = professor
      ? `${professor.firstName} ${professor.lastName}`
      : null;

    const professorDepartment = professor?.department;

    return (
      <tr
        key={student.id}
        className="border-t border-gray-200 text-gray-700 text-sm"
      >
        <td className="px-4 py-3">
          {student.firstName} {student.lastName}
        </td>
        <td className="px-4 py-3">{student.email}</td>
        <td className="px-4 py-3">{student.program || "Non spécifié"}</td>
        <td className="px-4 py-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(student.professorId)}`}
          >
            {student.professorId ? t("status.assigned") : t("status.unassigned")}
          </span>
        </td>
        <td className="px-4 py-3">
          {professorName ? (
            <div className="flex flex-col">
              <span>{professorName}</span>
              {professorDepartment && (
                <span className="text-xs text-gray-500">
                  {professorDepartment}
                </span>
              )}
            </div>
          ) : (
            t("noProfessor")
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAssign(student)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                student.professorId
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              <PersonIcon className="w-4 h-4" />
              <span>
                {student.professorId ? t("actions.reassign") : t("actions.assign")}
              </span>
            </button>
            {student.notificationFailed && (
              <button
                onClick={() => handleRetryNotification(student.assignmentId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{t("actions.retryNotification")}</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div className="space-y-6">
      <Header title={t("title")} />

      <Popover>
        {({ open, setOpen, triggerRef, contentRef }) => (
          <>
            <PopoverTrigger
              open={open}
              setOpen={setOpen}
              triggerRef={triggerRef}
            >
              <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.status")}:{" "}
                {filterStatus
                  ? t(`status.${filterStatus}`)
                  : t("filter.all")}
              </span>
            </PopoverTrigger>

            <PopoverContent open={open} contentRef={contentRef}>
              <div className="flex flex-col gap-2 min-w-[150px]">
                {["assigned", "unassigned"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setOpen(false);
                    }}
                    className={`px-3 py-1 rounded text-left ${
                      filterStatus === status
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {t(`status.${status}`)}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setFilterStatus(null);
                    setOpen(false);
                  }}
                  className="px-3 py-1 rounded text-left hover:bg-gray-100"
                >
                  {t("filter.all")}
                </button>
                <PopoverClose setOpen={setOpen}>
                  <span className="text-sm text-gray-600">
                    {t("menu.close")}
                  </span>
                </PopoverClose>
              </div>
            </PopoverContent>
          </>
        )}
      </Popover>

      {professors.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            {t("noProfessorsAvailable")}
          </p>
        </div>
      )}

      <Table
        headers={[
          t("table.student"),
          t("table.email"),
          t("table.program"),
          t("table.status"),
          t("table.professor"),
          t("table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("empty")}
      />

      <AssignmentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={{
          ...selectedStudent,
          professorName: selectedStudent?.professorId
            ? professors.find((p) => p.id === selectedStudent.professorId)
                ?.firstName +
              " " +
              professors.find((p) => p.id === selectedStudent.professorId)
                ?.lastName
            : null,
        }}
        onSuccess={() => {
          loadStudents();
        }}
      />
    </div>
  );
};
