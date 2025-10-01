import React, { useState } from "react";
import axios from "axios";

export default function AjoutStage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        targetedProgramme: "",
        employerEmail: "",
        expirationDate: ""
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.title.trim()) tempErrors.title = "Un titre est obligatoire.";
        if (!formData.description.trim()) tempErrors.description = "Une description est obligatoire.";
        if (!formData.targetedProgramme.trim()) tempErrors.targetedProgramme = "Un programme est obligatoire.";
        if (!formData.employerEmail.trim()) tempErrors.employerEmail = "Courriel est obligatoire.";
        else if (!/\S+@\S+\.\S+/.test(formData.employerEmail)) tempErrors.employerEmail = "Courriel est invalide.";
        if (!formData.expirationDate) tempErrors.expirationDate = "Une date limite est obligatoire.";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!validate()) return;

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                targetedProgramme: formData.targetedProgramme,
                employerEmail: formData.employerEmail,
                expirationDate: formData.expirationDate,
            };

            // J'ai essayé la variable baseURL, mais je me retrouve avec undefined.
            await axios.post(
                "http://localhost:8080/api/v1/employer/create-internship-offer", payload,
                {
                    headers: {
                        Authorization: "Bearer "+token,
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("Offre de stage publiée avec succès !");
            setFormData({
                title: "",
                description: "",
                targetedProgramme: "",
                employerEmail: "",
                expirationDate: ""
            });
            setErrors({});
        } catch (err) {
            setErrorMessage("Échec de soumission d'un stage.");
            console.error(err);
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh"
        }}>
            <h1 className="text-4xl mt-5 font-bold">Une nouvelle opportunité, à quelques clics.</h1>
            <p className="text-2xl my-5 font-bold">Publiez vos offres de stage à divers étudiants dès maintenant.</p>
            {successMessage && <p className="text-lg font-bold text-green-700">{successMessage}</p>}
            {errorMessage && <p className="text-lg text-center font-bold text-red-700">{errorMessage} <br></br>
                Assurez-vous d'entrer un courriel déjà enregistré sur la plateforme !</p>}

            <form onSubmit={handleSubmit}>
                <div className={"flex flex-col my-5"}>
                    <label className="text-xl font-semibold mb-2">Titre</label>
                    <input className="border-1 shadow rounded-sm mb-1 px-2 py-2" type="text"
                           placeholder="Ex : Stage à l'institut Health Research"
                           name="title" value={formData.title} onChange={handleChange} />
                    {errors.title && <p className="text-md font-bold text-yellow-500">{errors.title}</p>}
                </div>

                <div className={"flex flex-col mb-7"}>
                    <label className="text-xl font-semibold mb-2">Description</label>
                    <textarea className="border-1 shadow rounded-sm mb-1 px-2 py-2" name="description"
                              placeholder="Ex : Stage d'informatique en dans le domaine de la médecine à New York"
                              value={formData.description} onChange={handleChange} />
                    {errors.description && <p className="text-md font-bold text-yellow-500">{errors.description}</p>}
                </div>

                <div className={"flex flex-col mb-7"}>
                    <label className="text-xl font-semibold mb-2">Programme visé</label>
                    <input className="border-1 shadow rounded-sm mb-1 px-2 py-2" type="text" name="targetedProgramme"
                           placeholder="Ex : Informatique"
                           value={formData.targetedProgramme} onChange={handleChange} />
                    {errors.targetedProgramme && <p className="text-md font-bold text-yellow-500">{errors.targetedProgramme}</p>}
                </div>

                <div className={"flex flex-col mb-7"}>
                    <label className="text-xl font-semibold mb-2">Courriel associé à l'offre</label>
                    <input className="border-1 shadow rounded-sm mb-1 px-2 py-2" type="email" name="employerEmail"
                           placeholder="Ex : stage@info.com"
                           value={formData.employerEmail} onChange={handleChange} />
                    {errors.employerEmail && <p className="text-md font-bold text-yellow-500">{errors.employerEmail}</p>}
                </div>

                <div className={"flex flex-col mb-7"}>
                    <label className="text-xl font-semibold mb-2">Date limite</label>
                    <input className="border-1 shadow uppercase rounded-sm mb-1 text-gray-700 px-2 py-2" type="date"
                           name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
                    {errors.expirationDate && <p className="text-md font-bold text-yellow-500">{errors.expirationDate}</p>}
                </div>


                <button className="w-sm cursor-pointer p-4 bg-black rounded-xl  text-white text-xl
                                   shadow duration-500 hover:border-1 hover:font-semibold
                                   hover:text-2xl mb-10 transition-all" type="submit">
                    Soumettre l'offre
                </button>
            </form>
        </div>
    );
}