import { useEffect, useState } from "react";
import { cvService } from "../services/cvService.js";
import { geService } from "../services/geService.js";
import {internshipAgreementService} from "../services/internshipAgreementService.js";

export default function PdfViewer({ documentId, role, type }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    const load = async () => {
      try {
        setError(null);

        //let blob;
        console.log("documentId", documentId);
        //if (type === "CV") {
          const service = role === "gs" ? geService : cvService;
          console.log(role === "gs");
          const blob = await service.downloadCv(documentId);
        /*}
        else {
          blob = await internshipAgreementService.downloadAgreement(documentId);
        }*/

        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
      } catch (err) {
        console.error("❌ Erreur chargement PDF :", err);
        setError("Erreur lors du chargement du fichier");
      }
    };

    load();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [documentId, role]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!url) return <p>Chargement du document...</p>;

  return (
    <iframe
      src={url}
      className="w-full h-[90vh] border rounded-md shadow-sm"
      title="Aperçu PDF"
    />
  );
}
