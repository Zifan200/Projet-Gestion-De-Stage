import {useEffect, useState} from "react";
import {cvService} from "../../services/cvService.js";
import {FileTextIcon} from "@radix-ui/react-icons";
import {authService} from "../../services/authService.js";

export const StudentDashboard = () => {
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const data = await authService.getMe(token);
                    setUser(data);
                    console.log(data);
                }
                loadCvs();
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
    }, []);

    const loadCvs = async () => {
        setLoading(true);
        setCvs(await cvService.list());
        setLoading(false);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await cvService.upload(file);
        loadCvs();
    };

    const handleDownload = async (cvId, fileName) => {
        const blob = await cvService.download(cvId);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
    };

    const handleDelete = async (cvId) => {
        await cvService.remove(cvId);
        loadCvs();
    };

    const handlePreview = async (cvId, fileType) => {
        const blob = await cvService.download(cvId);
        const url = window.URL.createObjectURL(new Blob([blob]));
        setPreviewUrl(url);
        setPreviewType(fileType);
    };

    return (
        <div className="h-[100vh]">
            <div className={"flex h-full"}>
                <div className={"bg-[#F3F5F7] pt-10 pl-10 pr-10"}>
                    <h1 className={"text-5xl"}>Dashboard</h1>
                    <h3 className={"text-xl mt-10 uppercase"}>Menu</h3>
                    <div className={"mt-2 no-underline"}>
                        <div className={"bg-zinc-200 p-2 flex border-zinc-300 border rounded-xl mt-5"}>

                            <a className={"text-black cursor-pointer no-underline flex pl-4"}><span><FileTextIcon
                                className="w-5 h-5 mr-2 mt-auto mb-auto"/></span>Cvs</a>
                        </div>
                    </div>
                </div>
                <div className={"ml-auto mr-auto pt-10 w-full pr-30 pl-30"}>
                    <div className={"flex flex-col"}>

                        <div className="flex flex-row items-center justify-between mb-4 ml-auto mr-auto w-full">

                            <h2 className="text-xl font-semibold">Mes CVs</h2>
                            <label className="px-4 py-2 bg-[#007856] text-white rounded cursor-pointer">
                                Ajouter un CV
                                <input type="file" className="hidden" onChange={handleUpload}/>
                            </label>
                        </div>
                        <h4>Ici tu peux gérer tes CVs : en ajouter un, les visualiser, les télécharger ou les
                            supprimer.</h4>
                    </div>
                    <div className={"w-full h-[1px] bg-zinc-300 mb-10 mt-10 rounded-full"}></div>

                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow rounded">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Nom du fichier</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Taille</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cvs.map((cv) => (
                                    <tr key={cv.id} className="border-t border-zinc-300 text-zinc-700">
                                        <td className="px-4 py-2">{cv.fileName}</td>
                                        <td className="px-4 py-2">{cv.fileType}</td>
                                        <td className="px-4 py-2">
                                            {Math.round((cv.fileSize || 0) / 1024)} KB
                                        </td>
                                        <td className="px-4 py-2">
                                            {new Date(cv.uploadedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 space-x-2">
                                            <button
                                                className="px-2 py-1 border text-white bg-[#007856] rounded-lg"
                                                onClick={() => handleDownload(cv.id, cv.fileName)}
                                            >
                                                Télécharger
                                            </button>
                                            <button
                                                className="px-2 py-1 0 bg-black text-white rounded"
                                                onClick={() => handlePreview(cv.id, cv.fileType)}
                                            >
                                                Visualiser
                                            </button>
                                            <button
                                                className="px-2 py-1  text-white bg-red-400 rounded"
                                                onClick={() => handleDelete(cv.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {cvs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            Aucun CV pour l’instant
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                            <div className="bg-white w-3/4 h-3/4 rounded shadow-lg relative">
                                <button
                                    className="absolute top-2 right-2 text-white bg-red-600 px-3 py-1 rounded"
                                    onClick={() => setPreviewUrl(null)}
                                >
                                    Fermer
                                </button>

                                {previewType.includes("pdf") ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full rounded"
                                        title="CV PDF Viewer"
                                    />
                                ) : previewType.includes("word") ||
                                previewType.includes("docx") ? (
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                                            previewUrl
                                        )}&embedded=true`}
                                        className="w-full h-full rounded"
                                        title="CV DOCX Viewer"
                                    />
                                ) : (
                                    <p className="p-4">Format non supporté</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};