import { useState } from "react";
import styles from "../styles/EtudiantForm.module.css";

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
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.courriel)) newErrors.courriel = "Le courriel doit être valide";
        if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est obligatoire";
        else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.telephone)) newErrors.telephone = "Le téléphone doit être au format 514-123-4567";
        if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";
        if (!formData.programme.trim()) newErrors.programme = "Le programme est obligatoire";
        if (!formData.age) newErrors.age = "L'âge est obligatoire";
        else if (parseInt(formData.age) < 16) newErrors.age = "L'étudiant doit avoir au moins 16 ans";
        if (!formData.motDePasse.trim()) newErrors.motDePasse = "Le mot de passe est obligatoire";
        else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères";
        else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.motDePasse))
            newErrors.motDePasse = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial";
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
        console.log("Données du formulaire :", formData);

        try {
            const response = await fetch("http://localhost:8080/api/etudiants/inscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Réponse du backend :", data);
                setMessage("Inscription réussie ✅");
            } else if (response.status === 400) {
                const errorData = await response.json();
                console.error("Erreurs de validation :", errorData);
                setMessage("Erreur de validation ❌ (vérifie tes champs)");
            } else {
                setMessage("Une erreur est survenue ❌");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            setMessage("Impossible de contacter le serveur ❌");
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.formulaire} onSubmit={handleSubmit}>
                <h2 className={styles.titre}>Inscription Étudiant</h2>

                {["nom","prenom","courriel","telephone","adresse","programme","age"].map(field => (
                    <div key={field}>
                        <input
                            className={styles.inputField}
                            type={field === "age" ? "number" : "text"}
                            name={field}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={formData[field]}
                            onChange={handleChange}
                        />
                        {errors[field] && <p className={styles.error}>{errors[field]}</p>}
                    </div>
                ))}

                <input
                    className={styles.inputField}
                    type="password"
                    name="motDePasse"
                    placeholder="Mot de passe"
                    value={formData.motDePasse}
                    onChange={handleChange}
                />
                {errors.motDePasse && <p className={styles.error}>{errors.motDePasse}</p>}

                <button type="submit" className={styles.submitButton}>Soumettre</button>
                {message && <p className={styles.message}>{message}</p>}
            </form>
        </div>
    );
}
