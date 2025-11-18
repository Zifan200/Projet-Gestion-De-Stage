import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { Header } from "../../components/ui/header.jsx";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Table } from "../../components/ui/table.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Modal } from "../../components/ui/modal.jsx";
import PdfViewerEntente from "../../components/PdfViewerEntente.jsx";
import useAuthStore from "../../stores/authStore.js";
import { api } from "../../lib/api.js";

export const EmployerInternshipAgreements = () => {
    const { t } = useTranslation("internship_agreements");
    const user = useAuthStore((s) => s.user);
    const { applications, fetchApplications, loading } = useEmployerStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handlePreview = async (agreementId) => {
        try {
            const res = await api.get(`/entente/${agreementId}/preview`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: "arraybuffer"
            });
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (err) {
            console.error("Erreur preview PDF :", err);
        }
    };

    const handleDownload = async (agreementId) => {
        try {
            const res = await api.get(`/entente/${agreementId}/download`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: "blob"
            });
            const url = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `entente_${agreementId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erreur téléchargement PDF :", err);
        }
    };

    const tableRows = () =>
        applications.map((app) => (
            <tr key={app.id}>
                <td>{app.studentFirstName} {app.studentLastName}</td>
                <td>{app.internshipOfferTitle}</td>
                <td>
                    <TableActionButton
                        icon={EyeOpenIcon}
                        label={t("table.actionviewAgreement")}
                        onClick={() => { setSelectedApplication(app); handlePreview(app.ententeStagePdfId); setIsModalOpen(true); }}
                    />
                    <TableActionButton
                        icon={DownloadIcon}
                        label={t("table.download")}
                        onClick={() => handleDownload(app.ententeStagePdfId)}
                    />
                </td>
            </tr>
        ));

    return (
        <div>
            <Header title={t("title")} />

            {loading ? <p>{t("table.loading")}</p> :
                <Table
                    headers={[t("table.studentName"), t("table.offerTitle"), t("table.action")]}
                    rows={tableRows()}
                />
            }

            {previewUrl && selectedApplication && (
                <Modal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setPreviewUrl(null); setSelectedApplication(null); }}
                    title={selectedApplication.studentFirstName + " " + selectedApplication.studentLastName}
                >
                    <PdfViewerEntente previewUrl={previewUrl} />
                </Modal>
            )}
        </div>
    );
};
