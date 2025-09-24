import { useEffect, useState } from "react";
import {cvService} from "../services/cvService.js";

export default function PdfViewer({ cvId }) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        const load = async () => {
            const blobUrl = await cvService.preview(cvId);
            setUrl(blobUrl);
        };
        load();
    }, [cvId]);

    if (!url) return <p>Chargement...</p>;

    return (
        <iframe
            src={url}
            className="w-full h-[90vh] border rounded"
            title="PDF Viewer"
        />
    );
}