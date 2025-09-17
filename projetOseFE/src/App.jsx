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

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            console.log("Données envoyées au backend :", formData);
            console.error("Debug formData:", formData)
            const response = await fetch("http://localhost:8080/api/etudiants/inscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2>Inscription Étudiant</h2>

            <div>
                <label>Nom :</label>
                <input name="nom" value={formData.nom} onChange={handleChange} />
            </div>
            <div>
                <label>Prénom :</label>
                <input name="prenom" value={formData.prenom} onChange={handleChange} />
            </div>
            <div>
                <label>Courriel :</label>
                <input name="courriel" type="email" value={formData.courriel} onChange={handleChange} />
            </div>
            <div>
                <label>Téléphone :</label>
                <input name="telephone" value={formData.telephone} onChange={handleChange} />
            </div>
            <div>
                <label>Adresse :</label>
                <input name="adresse" value={formData.adresse} onChange={handleChange} />
            </div>
            <div>
                <label>Programme :</label>
                <input name="programme" value={formData.programme} onChange={handleChange} />
            </div>
            <div>
                <label>Âge :</label>
                <input name="age" type="number" value={formData.age} onChange={handleChange} />
            </div>
            <div>
                <label>Mot de passe :</label>
                <input name="motDePasse" type="password" value={formData.motDePasse} onChange={handleChange} />
            </div>

            <button type="submit">Soumettre</button>

            {message && <p>{message}</p>}
        </form>
    );
}
