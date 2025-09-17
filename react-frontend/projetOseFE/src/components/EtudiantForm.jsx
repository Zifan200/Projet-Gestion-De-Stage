import { useState } from "react";

export default function EtudiantForm() {
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        courriel: "",
        telephone: "",
        adresse: "",
        programme: "",
        age: "",
        motDePasse: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
        if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";

        if (!formData.courriel.trim()) {
            newErrors.courriel = "Le courriel est obligatoire";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.courriel)) {
            newErrors.courriel = "Le courriel doit être valide";
        }

        if (!formData.telephone.trim()) {
            newErrors.telephone = "Le téléphone est obligatoire";
        } else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.telephone)) {
            newErrors.telephone = "Le téléphone doit être au format 514-123-4567";
        }

        if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";
        if (!formData.programme.trim()) newErrors.programme = "Le programme est obligatoire";

        if (!formData.age) {
            newErrors.age = "L'âge est obligatoire";
        } else if (parseInt(formData.age) < 16) {
            newErrors.age = "L'étudiant doit avoir au moins 16 ans";
        }

        if (!formData.motDePasse.trim()) {
            newErrors.motDePasse = "Le mot de passe est obligatoire";
        } else if (formData.motDePasse.length < 8) {
            newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères";
        } else if (
            !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.motDePasse)
        ) {
            newErrors.motDePasse =
                "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial";
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } /* else {
            setErrors({});
            console.log("Données du formulaire :", formData);
            alert("Formulaire soumis !");
        }*/
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 dark:bg-gray-800">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
                    Inscription Étudiant
                </h2>

                {[
                    { label: "Nom", name: "nom", type: "text" },
                    { label: "Prénom", name: "prenom", type: "text" },
                    { label: "Courriel", name: "courriel", type: "email" },
                    { label: "Téléphone", name: "telephone", type: "text" },
                    { label: "Adresse", name: "adresse", type: "text" },
                    { label: "Programme", name: "programme", type: "text" },
                    { label: "Âge", name: "age", type: "number" },
                ].map((field) => (
                    <div key={field.name} className="mb-4">
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                            {field.label} :
                        </label>
                        <input
                            name={field.name}
                            type={field.type}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                        )}
                    </div>
                ))}

                {/* Champ Mot de passe */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                        Mot de passe :
                    </label>
                    <input
                        name="motDePasse"
                        type="password"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.motDePasse && (
                        <p className="text-red-500 text-sm mt-1">{errors.motDePasse}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Soumettre
                </button>
            </form>
        </div>
    );
}
