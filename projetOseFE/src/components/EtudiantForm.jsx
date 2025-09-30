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
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        adresse: "",
        program: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "Le nom est obligatoire";
        if (!formData.lastName.trim()) newErrors.lastName = "Le prénom est obligatoire";

        if (!formData.email.trim()) newErrors.email = "Le courriel est obligatoire";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Le courriel doit être valide";

        if (!formData.phone.trim()) newErrors.phone = "Le téléphone est obligatoire";
        else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone))
            newErrors.phone = "Le téléphone doit être au format 514-123-4567";

        if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";

        if (!formData.program.trim()) newErrors.program = "Le programme est obligatoire";

        if (!formData.password.trim()) newErrors.password = "Le mot de passe est obligatoire";
        else if (formData.password.length < 8) newErrors.password = "Au moins 8 caractères requis";
        else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.password))
            newErrors.password = "Doit contenir majuscule, minuscule, chiffre et caractère spécial";

        if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Veuillez confirmer le mot de passe";
        else if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

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
            const response = await fetch("http://localhost:8080/api/v1/student/register", {
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
                        name="firstName"
                        placeholder="Nom"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Prénom"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Courriel"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Téléphone (514-123-4567)"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
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
                    <label htmlFor="program" className={styles.label}>Programme</label>
                    <select
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        className={styles.inputField}
                    >
                        <option value="">-- Sélectionnez un programme --</option>
                        {programmes.map((prog, index) => (
                            <option key={index} value={prog}>{prog}</option>
                        ))}
                    </select>
                    {errors.program && <p className={styles.error}>{errors.program}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.password && <p className={styles.error}>{errors.password}</p>}
                </div>

                <div className={styles.inputContainer}>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                    {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className={styles.submitButton}>Soumettre</button>
                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.linkContainer}>
                    <Link to="/login/etudiant" className="text-blue-600 hover:underline">
                        Déjà inscrit ? Connectez-vous
                    </Link>
                </div>
            </form>
        </div>
    );
}
