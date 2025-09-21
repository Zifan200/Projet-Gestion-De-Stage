import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <h1>Bienvenue sur l'application</h1>
            <Link to="/inscription-etudiant">
                <button style={{ padding: "10px 20px", marginTop: "20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Inscription Étudiant
                </button>
            </Link>
        </div>
    );
}
