import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/EtudiantForm.module.css";

const programmes = [
    "Technique de l'informatique",
    "Science de la nature",
    "Cinéma",
    "Soins infirmiers",
];

export default function EtudiantForm() {
    const [formData, setFormData] = useState({
        nom: "", prenom: "", courriel: "", telephone: "",
        adresse: "", programme: "", age: "", motDePasse: "", confirmerMotDePasse: ""
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

        // Validation mot de passe
        if (!formData.motDePasse.trim()) newErrors.motDePasse = "Le mot de passe est obligatoire";
        else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Au moins 8 caractères requis";
        else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.motDePasse))
            newErrors.motDePasse = "Doit contenir majuscule, minuscule, chiffre et caractère spécial";

        // Validation confirmation mot de passe
        if (!formData.confirmerMotDePasse.trim()) newErrors.confirmerMotDePasse = "Veuillez confirmer le mot de passe";
        else if (formData.motDePasse !== formData.confirmerMotDePasse)
            newErrors.confirmerMotDePasse = "Les mots de passe ne correspondent pas";

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

    return (
        <div className={styles.container}>
            <form className={styles.formulaire} onSubmit={handleSubmit}>
                <h2 className={styles.titre}>Inscription Étudiant</h2>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="nom"
                        placeholder="Nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.nom && <p className={styles.error}>{errors.nom}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="prenom"
                        placeholder="Prénom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.prenom && <p className={styles.error}>{errors.prenom}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="email"
                        name="courriel"
                        placeholder="Courriel"
                        value={formData.courriel}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.courriel && <p className={styles.error}>{errors.courriel}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="telephone"
                        placeholder="Téléphone (514-123-4567)"
                        value={formData.telephone}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.telephone && <p className={styles.error}>{errors.telephone}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="adresse"
                        placeholder="Adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.adresse && <p className={styles.error}>{errors.adresse}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="number"
                        name="age"
                        placeholder="Âge"
                        value={formData.age}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.age && <p className={styles.error}>{errors.age}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <label htmlFor="programme" className={styles.label}>Programme</label>
                    <select
                        name="programme"
                        value={formData.programme}
                        onChange={handleChange}
                        className={styles.inputField}
                    >
                        <option value="">-- Sélectionnez un programme --</option>
                        {programmes.map((prog, index) => (
                            <option key={index} value={prog}>{prog}</option>
                        ))}
                    </select>
                    {errors.programme && <p className={styles.error}>{errors.programme}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="password"
                        name="motDePasse"
                        placeholder="Mot de passe"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.motDePasse && <p className={styles.error}>{errors.motDePasse}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="password"
                        name="confirmerMotDePasse"
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmerMotDePasse}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.confirmerMotDePasse && <p className={styles.error}>{errors.confirmerMotDePasse}</p>}
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
