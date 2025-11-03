import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Header } from "../../components/ui/header.jsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";

import {
    EyeOpenIcon,
    DownloadIcon,
    Cross2Icon,
} from "@radix-ui/react-icons";

export const InternshipApplicationsGE = () => {
    const { t } = useTranslation("internship_applications");

    // Mock data pour tester le design
    const applications = [
        {
            id: 1,
            studentFirstName: "Alice",
            studentLastName: "Dupont",
            studentEmail: "alice.dupont@mail.com",
            selectedCvFileName: "alice_cv.pdf",
            selectedCvID: 101,
            internshipOfferTitle: "Développeur Java",
            status: "PENDING",
            createdAt: "2025-11-02T12:00:00Z",
        },
        {
            id: 2,
            studentFirstName: "Bob",
            studentLastName: "Martin",
            studentEmail: "bob.martin@mail.com",
            selectedCvFileName: "bob_cv.pdf",
            selectedCvID: 102,
            internshipOfferTitle: "Frontend React",
            status: "ACCEPTED",
            createdAt: "2025-10-28T08:30:00Z",
        },
    ];

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);

    const handleAction = (action, app) => {
        switch (action) {
            case "view":
                setSelectedApplication(app);
                setIsModalOpen(true);
                break;
            case "download":
                alert(`Téléchargement CV: ${app.selectedCvFileName}`);
                break;
            default:
                break;
        }
    };

    const columns = [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "studentName", label: t("table.studentName") },
        { key: "studentEmail", label: t("table.studentEmail") },
        { key: "selectedCvFileName", label: t("table.cv") },
        { key: "status", label: t("table.status") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <>
                            <EyeOpenIcon className="w-4 h-4" />
                            <span>{t("table.actionView")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <>
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t("table.download")}</span>
                        </>
                    ),
                },
            ],
        },
    ];

    const sortedAndFilteredApplications = useMemo(() => {
        const filtered = filterStatus
            ? applications.filter((app) => app.status === filterStatus)
            : applications;
        return [...filtered].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [applications, filterStatus]);

    const tableData = sortedAndFilteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.status?.toLowerCase(),
        status: t(`status.${app.status?.toLowerCase()}`),
    }));

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filter */}
            <Popover>
                {({ open, setOpen, triggerRef, contentRef }) => (
                    <>
                        <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
              <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.status")}:{" "}
                  {filterStatus
                      ? t(`status.${filterStatus.toLowerCase()}`)
                      : t("filter.all")}
              </span>
                        </PopoverTrigger>
                        <PopoverContent open={open} contentRef={contentRef}>
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
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
                                        {t(`status.${status.toLowerCase()}`)}
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
                                    <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                </PopoverClose>
                            </div>
                        </PopoverContent>
                    </>
                )}
            </Popover>

            <DataTable columns={columns} data={tableData} onAction={handleAction} />

            {/* Modal Preview */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <EyeOpenIcon className="w-5 h-5 text-blue-500" />
                            {selectedApplication.studentFirstName}{" "}
                            {selectedApplication.studentLastName}
                        </h2>
                        <p>
                            <strong>{t("modal.email")}:</strong>{" "}
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("modal.cv")}:</strong>{" "}
                            {selectedApplication.selectedCvFileName || t("table.noCv")}
                        </p>
                        <p>
                            <strong>{t("modal.offerTitle")}:</strong>{" "}
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("modal.status")}:</strong>{" "}
                            {t(`status.${selectedApplication.status?.toLowerCase()}`)}
                        </p>
                        <p>
                            <strong>{t("modal.appliedAt")}:</strong>{" "}
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-6 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                <Cross2Icon className="w-4 h-4" />
                                {t("modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
