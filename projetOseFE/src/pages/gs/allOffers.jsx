import { useTranslation } from "react-i18next";
import { Table } from "../../components/ui/table.jsx";
import { Header } from "../../components/ui/header.jsx";
import React, { useEffect, useState } from "react";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Button } from "../../components/ui/button.jsx";
import { useGeStore } from "../../stores/geStore.js";
import { ModalSelectedOfferApplicants } from "./gsModalSelectedOfferApplicants.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { ReasonModal } from "../../components/ui/reason-modal.jsx";

export const AllOffers = () => {
    const { t } = useTranslation("gs_dashboard_all_internships");
    const user = useAuthStore((s) => s.user);

    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOffers, setCurrentOffers] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    //student application
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isOfferApplicationListModalOpen, setIsOfferApplicationListModalOpen] = useState(false);

    const studentNameFilterTypes = {
        ALPHABETICAL: t(
            "gs_modal_selectedOfferApplications.filters.studentNameFilters.alphabetical",
        ),
        REVERSE_ALPHABETICAL: t(
            "gs_modal_selectedOfferApplications.filters.studentNameFilters.reverseAlphabetical",
        ),
    };
    const [currentStudentNameFilter, setCurrentStudentNameFilter] = useState(
        studentNameFilterTypes.ALPHABETICAL,
    );

    const offerStatuses = {
        ALL: t("filter.all"),
        PENDING: t("status.pending"),
        ACCEPTED: t("status.accepted"),
        REJECTED: t("status.rejected"),
    };

    const [currentOfferStatus, setCurrentOfferStatus] = useState(
        offerStatuses.ALL,
    );
    const [currentProgram, setCurrentProgram] = useState(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
    const [currentSession, setCurrentSession] = useState("Hiver");


    const {
        offers,
        loadAllOffersSummary,
        acceptedOffers,
        loadAcceptedOffers,
        rejectedOffers,
        loadRejectedOffers,
        pendingOffers,
        loadPendingOffers,
        programs,
        loadPrograms,
        viewOffer,
        loading,
        updateOfferStatus,
        downloadOfferPdf,
    } = useOfferStore();

    const { selectedOfferApplications, error } = useGeStore();

    useEffect(() => {
        const loadAllData = async () => {
            await loadPrograms();
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        };
        loadAllData();
    }, []);

    useEffect(() => {
        applyCurrentFilter();
    }, [
        currentOfferStatus,
        currentProgram,
        currentSession,
        currentYear,
        offers,
        pendingOffers,
        acceptedOffers,
        rejectedOffers,
    ]);

    const applyCurrentFilter = () => {
        let listToFilter = [];
        switch (currentOfferStatus) {
            case offerStatuses.PENDING:
                listToFilter = pendingOffers;
                break;
            case offerStatuses.ACCEPTED:
                listToFilter = acceptedOffers;
                break;
            case offerStatuses.REJECTED:
                listToFilter = rejectedOffers;
                break;
            case offerStatuses.ALL:
                listToFilter = offers;
                break;
        }

        let filtered = listToFilter;

        // Filter by program
        if (currentProgram) {
            filtered = filtered.filter((o) => o.targetedProgramme === currentProgram);
        }

        // Filter by session
        if (currentSession && currentSession !== "All") {
            filtered = filtered.filter((o) => o.session === currentSession);
        }

        // Filter by year
        filtered = filtered.filter((o) => {
            if (!o.startDate) return false;
            const year = new Date(o.startDate).getFullYear();
            return year.toString() === currentYear;
        });

        // **Update the state**
        setCurrentOffers(filtered);
    };


    // Extract available years
    const availableYears = Array.from(
        new Set(
            offers
                .filter((o) => o.startDate)
                .map((o) => new Date(o.startDate).getFullYear()),
        ),
    ).sort((a, b) => b - a);

    const openOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("error.loadOffer"));
        }
    };

    const handleAccept = async () => {
        try {
            await updateOfferStatus(user.token, selectedOffer.id, "ACCEPTED", "");
            toast.success(t("modal.accepted"));
            setIsModalOpen(false);
            setSelectedOffer(null);
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        } catch (err) {
            console.error(err);
            toast.error(t("error.updateStatus"));
        }
    };

    const handleReject = async (reason) => {
        try {
            await updateOfferStatus(
                user.token,
                selectedOffer.id,
                "REJECTED",
                reason,
            );
            toast.success(t("modal.rejectSuccess"));
            setIsModalOpen(false);
            setShowRejectModal(false);
            setSelectedOffer(null);
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        } catch (err) {
            console.error(err);
            toast.error(t("error.rejectFailed"));
        }
    };

    const handleDownload = async (id) => {
        try {
            await downloadOfferPdf(user.token, id);
            toast.success(t("success.download"));
        } catch {
            toast.error(t("error.download"));
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
    };

    const tableRows = () =>
        currentOffers.map((offer) => (
            <tr
                key={offer.id}
                className="border-t border-gray-200 text-gray-700 text-sm"
            >
                <td className="px-4 py-3">{offer.title}</td>
                <td className="px-4 py-3">{offer.enterpriseName}</td>
                <td className="px-4 py-3">{offer.targetedProgramme}</td>
                <td className="px-4 py-3">
          <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(offer.status)}`}
          >
            {t(`status.${offer.status?.toLowerCase()}`)}
          </span>
                </td>
                <td className="px-4 py-3">
                    {new Date(offer.expirationDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openOffer(offer.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            <EyeOpenIcon className="w-4 h-4" />
                            <span>{t("actions.view")}</span>
                        </button>
                        <button
                            onClick={() => handleDownload(offer.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t("actions.download")}</span>
                        </button>
                    </div>
                </td>
            </tr>
        ));


    return (
        <div className="space-y-6 min-h-screen">
            <Header title={t("title")} />

            {/* Filters */}
            <div className="flex items-center gap-4">
                {/* Status Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {currentOfferStatus}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {Object.values(offerStatuses).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setCurrentOfferStatus(status);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                currentOfferStatus === status
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
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

                {/* Program Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.program")}: {currentProgram || t("programAll")}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    <button
                                        onClick={() => {
                                            setCurrentProgram(null);
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            !currentProgram
                                                ? "bg-blue-100 font-semibold"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {t("programAll")}
                                    </button>
                                    {programs.map((program) => (
                                        <button
                                            key={program}
                                            onClick={() => {
                                                setCurrentProgram(program);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                currentProgram === program
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {program}
                                        </button>
                                    ))}
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

                {/* Session Filter
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
            <>
              <PopoverTrigger
                open={open}
                setOpen={setOpen}
                triggerRef={triggerRef}
              >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("gs_dashboard_offers:filter.session")}:{" "}
                  {currentSession !== "All"
                    ? currentSession
                    : t("gs_dashboard_offers:session.all")}
                </span>
              </PopoverTrigger>
              <PopoverContent open={open} contentRef={contentRef}>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  {["Automne", "Hiver"].map((session) => (
                    <button
                      key={session}
                      onClick={() => {
                        setCurrentSession(session);
                        setOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-left ${
                        currentSession === session
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {session}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCurrentSession("All");
                      setOpen(false);
                    }}
                    className="px-3 py-1 rounded text-left hover:bg-gray-100"
                  >
                    {t("gs_dashboard_offers:session.all")}
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
        </Popover>*/}

                {/* Year Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("gs_dashboard_offers:filter.year")}:{" "}
                    {currentYear !== "All"
                        ? currentYear
                        : t("gs_dashboard_offers:session.year")}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setCurrentYear(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                currentYear === year.toString()
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}

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
            </div>

            {loading ? (
                <p>{t("table.loading")}</p>
            ) : (
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.enterprise"),
                        t("table.program"),
                        t("table.status"),
                        t("table.deadline"),
                        t("actions.view"),
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("table.noOffers")}
                />
            )}

            {/* Modal détails de l'offre */}
            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedOffer(null);
                }}
                title={selectedOffer?.title}
                size="default"
                footer={
                    selectedOffer?.status.toUpperCase() === "PENDING" ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOffer(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <span>{t("modal.close")}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                <span>{t("actions.reject")}</span>
                            </button>
                            <button
                                onClick={handleAccept}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                            >
                                <span>{t("modal.accept")}</span>
                            </button>
                        </>
                    ) : selectedOffer?.status.toUpperCase() === "ACCEPTED" ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOffer(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <span>{t("modal.close")}</span>
                            </button>
                            {selectedOffer.applicationCount > 0 && (
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setTimeout(() => setIsOfferApplicationListModalOpen(true), 150);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                    <span>{t("modalSelectedOfferApplications.btnLabels.seeApplications")}</span>
                                    <span className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                    {selectedOffer.applicationCount}
                  </span>
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedOffer(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            <span>{t("modal.close")}</span>
                        </button>
                    )
                }
            >
                {selectedOffer && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.companyEmail")}</h3>
                                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.targetedProgramme")}</h3>
                                <p className="text-gray-600">{selectedOffer.targetedProgramme}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {selectedOffer.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.description")}</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.description}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.salary")}</h3>
                                <p className="text-gray-600">
                                    { localStorage.key("lang") === "fr" ?
                                        selectedOffer.salary.toLocaleString("fr-CA", {style:"currency", currency:"CAD"}) :
                                        selectedOffer.salary.toLocaleString("en-CA", {style:"currency", currency:"CAD"})
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {selectedOffer.publishedDate && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.publishedDate")}</h3>
                                    <p className="text-gray-600">{new Date(selectedOffer.publishedDate).toLocaleDateString()}</p>
                                </div>
                            )}

                            {selectedOffer.expirationDate && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.deadline")}</h3>
                                    <p className="text-gray-600">{new Date(selectedOffer.expirationDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.status")}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOffer.status)}`}>
                {t(`status.${selectedOffer.status?.toLowerCase()}`)}
              </span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de rejet */}
            <ReasonModal
                open={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onSubmit={handleReject}
                title={t("modal.rejectReason")}
                description={t("modal.reasonDescription")}
                placeholder={t("modal.reasonPlaceholder")}
                cancelLabel={t("modal.cancel")}
                confirmLabel={t("modal.confirm")}
                reasonLabel={t("modal.rejectReason")}
            />

            {/* Modal liste des candidatures */}
            <Modal
                open={isOfferApplicationListModalOpen}
                onClose={() => {
                    setIsOfferApplicationListModalOpen(false);
                    setTimeout(() => setIsModalOpen(true), 150);
                }}
                title={`${t("modalSelectedOfferApplications.title")} : ${selectedOffer?.title || ""}`}
                size="large"
                footer={
                    <button
                        onClick={() => {
                            setIsOfferApplicationListModalOpen(false);
                            setTimeout(() => setIsModalOpen(true), 150);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        <span>{t("modalSelectedOfferApplications.btnLabels.back")}</span>
                    </button>
                }
            >
                {selectedOffer && (
                    <ModalSelectedOfferApplicants offerId={selectedOffer.id} />
                )}
            </Modal>
        </div>
    );
};