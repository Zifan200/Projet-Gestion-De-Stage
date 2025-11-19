import { useEffect, useState } from "react";
import { cvService } from "../services/cvService.js";
import { geService } from "../services/geService.js";

export default function PdfViewer({ cvId, role }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cvId) return;

    const load = async () => {
      try {
        setError(null);

        const service = role === "gs" ? geService : cvService;
        console.log(role === "gs");

        const blob = await service.downloadCv(cvId);

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
  }, [cvId, role]);

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
