import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/EtudiantForm.module.css";

const inputFields = [
    { name: "nom", type: "text", placeholder: "Nom" },
    { name: "prenom", type: "text", placeholder: "Prénom" },
    { name: "courriel", type: "email", placeholder: "Courriel" },
    { name: "telephone", type: "text", placeholder: "Téléphone (514-123-4567)" },
    { name: "adresse", type: "text", placeholder: "Adresse" },
    { name: "age", type: "number", placeholder: "Âge" },
];

const programmes = [
    "Technique de l'informatique",
    "Science de la nature",
    "Cinéma",
    "Soins infirmiers",
];

export default function EtudiantForm() {
    const [formData, setFormData] = useState({
        nom: "", prenom: "", courriel: "", telephone: "",
        adresse: "", programme: "", age: "", motDePasse: ""
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
        if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";

        if (!formData.courriel.trim()) newErrors.courriel = "Le courriel est obligatoire";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.courriel))
            newErrors.courriel = "Le courriel doit être valide";

        if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est obligatoire";
        else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.telephone))
            newErrors.telephone = "Le téléphone doit être au format 514-123-4567";

        if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";

        if (!formData.programme.trim()) newErrors.programme = "Le programme est obligatoire";

        if (!formData.age) newErrors.age = "L'âge est obligatoire";
        else if (parseInt(formData.age) < 16) newErrors.age = "L'étudiant doit avoir au moins 16 ans";

        if (!formData.motDePasse.trim()) newErrors.motDePasse = "Le mot de passe est obligatoire";
        else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Au moins 8 caractères requis";
        else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.motDePasse))
            newErrors.motDePasse = "Doit contenir majuscule, minuscule, chiffre et caractère spécial";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        console.log("=== Envoi au back ===", JSON.stringify(formData));

        try {
            const response = await fetch("http://localhost:8080/api/etudiants/inscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Réponse backend :", data);
                setMessage("Inscription réussie ✅");
            } else if (response.status === 400) {
                const errorData = await response.json();
                console.error("Erreurs backend :", errorData);
                setMessage("Erreur de validation ❌");
            } else {
                setMessage("Une erreur est survenue ❌");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            setMessage("Impossible de contacter le serveur ❌");
        }
    };

    const InputField = ({ field }) => (
        <div className={styles.inputContainer}>
            <input
                className={styles.inputField}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
            />
            {errors[field.name] && <p className={styles.error}>{errors[field.name]}</p>}
        </div>
    );

    return (
        <div className={styles.container}>
            <form className={styles.formulaire} onSubmit={handleSubmit}>
                <h2 className={styles.titre}>Inscription Étudiant</h2>

                {inputFields.map(field => <InputField key={field.name} field={field} />)}

                {/* Champ programme avec select */}
                <div className={styles.inputContainer}>
                    <label htmlFor="programme" className={styles.label}>Programme</label>
                    <select
                        className={styles.inputField}
                        name="programme"
                        value={formData.programme}
                        onChange={handleChange}
                    >
                        <option value="">-- Sélectionnez un programme --</option>
                        {programmes.map((prog, index) => (
                            <option key={index} value={prog}>{prog}</option>
                        ))}
                    </select>
                    {errors.programme && <p className={styles.error}>{errors.programme}</p>}
                </div>

                {/* Champ mot de passe */}
                <div className={styles.inputContainer}>
                    <input
                        className={styles.inputField}
                        type="password"
                        name="motDePasse"
                        placeholder="Mot de passe"
                        value={formData.motDePasse}
                        onChange={handleChange}
                    />
                    {errors.motDePasse && <p className={styles.error}>{errors.motDePasse}</p>}
                </div>

                <button type="submit" className={styles.submitButton}>Soumettre</button>
                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.linkContainer}>
                    <Link to="/connexion-etudiant" className="text-blue-600 hover:underline">
                        Déjà inscrit ? Connectez-vous
                    </Link>
                </div>
            </form>
        </div>
    );
}
