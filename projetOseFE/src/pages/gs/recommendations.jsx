import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { RecommendationModal } from "../../components/ui/recommendation-modal.jsx";
import { useAssignmentStore } from "../../stores/assignmentStore.js";
import { useRecommendationStore } from "../../stores/recommendationStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import { StarIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";

export const GsRecommendations = () => {
  const { t } = useTranslation("gs_dashboard_recommendations");
  const { token } = useAuthStore();
  const { students, loadStudents } = useAssignmentStore();
  const {
    recommendations,
    loadAllRecommendations,
    deleteRecommendation,
    loading,
  } = useRecommendationStore();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterProgram, setFilterProgram] = useState(null);

  useEffect(() => {
    if (token) {
      loadStudents(token);
      loadAllRecommendations(token);
    }
  }, [token]);

  const handleRecommend = (student) => {
    const studentRecs = recommendations.filter((r) => r.studentId === student.id);
    setSelectedStudent({
      ...student,
      existingRecommendations: studentRecs
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (recommendationId) => {
    if (window.confirm(t("confirmDelete"))) {
      try {
        await deleteRecommendation(token, recommendationId);
        toast.success(t("toast.recommendationDeleted"));
        loadAllRecommendations(token);
      } catch {
        toast.error(t("toast.deleteError"));
      }
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "BRONZE":
        return "bg-orange-100 text-orange-800";
      case "SILVER":
        return "bg-gray-100 text-gray-800";
      case "GOLD":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityOrder = (priority) => {
    switch (priority) {
      case "GOLD":
        return 1;
      case "SILVER":
        return 2;
      case "BRONZE":
        return 3;
      case "BLUE":
        return 2;
      case "GREEN":
        return 3;
      default:
        return 4;
    }
  };

  const programs = useMemo(() => {
    const uniquePrograms = [...new Set(students.map((s) => s.program).filter(Boolean))];
    return uniquePrograms;
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!filterProgram) return students;
    return students.filter((s) => s.program === filterProgram);
  }, [students, filterProgram]);

  const rows = filteredStudents.map((student) => {
    const studentRecommendations = recommendations
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => getPriorityOrder(a.priorityCode) - getPriorityOrder(b.priorityCode));

    return (
      <tr
        key={student.id}
        className="border-t border-gray-200 text-gray-700 text-sm"
      >
        <td className="px-4 py-3">
          {student.firstName} {student.lastName}
        </td>
        <td className="px-4 py-3 hidden md:table-cell">{student.email}</td>
        <td className="px-4 py-3">{student.program || t("noProgram")}</td>
        <td className="px-4 py-3 hidden md:table-cell">
          <div className="flex flex-col gap-1">
            {studentRecommendations.length === 0 ? (
              <span className="text-gray-400 text-xs">{t("noRecommendations")}</span>
            ) : (
              studentRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClass(rec.priorityCode)}`}
                  >
                    {t(`priority.${rec.priorityCode.toLowerCase()}.badge`)}
                  </span>
                  <span className="text-xs truncate max-w-[200px]" title={rec.offerTitle}>
                    {rec.offerTitle}
                  </span>
                </div>
              ))
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => handleRecommend(student)}
            className="inline-flex items-center gap-1.5 p-2 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <StarIcon className="w-4 h-4" />
            <span className="hidden md:inline">{t("actions.recommend")}</span>
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Header title={t("title")} />

      <Popover>
        {({ open, setOpen, triggerRef, contentRef }) => (
          <>
            <PopoverTrigger
              open={open}
              setOpen={setOpen}
              triggerRef={triggerRef}
            >
              <span className="px-3 md:px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                <span className="hidden md:inline">{t("filter.program")}: </span>
                {filterProgram || t("filter.all")}
              </span>
            </PopoverTrigger>

            <PopoverContent open={open} contentRef={contentRef}>
              <div className="flex flex-col gap-2 min-w-[120px] md:min-w-[150px]">
                {programs.map((program) => (
                  <button
                    key={program}
                    onClick={() => {
                      setFilterProgram(program);
                      setOpen(false);
                    }}
                    className={`px-3 py-1 rounded text-left ${
                      filterProgram === program
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {program}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setFilterProgram(null);
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          {t("info.maxGold")}
        </p>
      </div>

      <Table
        headers={[
          t("table.student"),
          { label: t("table.email"), className: "hidden md:table-cell" },
          t("table.program"),
          { label: t("table.recommendations"), className: "hidden md:table-cell" },
          t("table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("empty")}
      />

      <RecommendationModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          loadAllRecommendations(token);
        }}
      />
    </div>
  );
};
