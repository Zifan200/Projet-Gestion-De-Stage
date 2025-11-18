const PdfViewerEntente = ({ previewUrl }) => {
    if (!previewUrl) return null;

    return (
        <iframe
            src={previewUrl} // ← c’est maintenant une URL valide
            type="application/pdf"
            className="w-full h-[90vh] border rounded-md shadow-sm"
            title="Aperçu PDF"
        />
    );
};

export default PdfViewerEntente;
