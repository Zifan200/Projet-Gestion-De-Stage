import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EtudiantForm from "./components/EtudiantForm";
import EtudiantConnection from "./components/EtudiantConnection";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inscription-etudiant" element={<EtudiantForm />} />
                <Route path="/connexion-etudiant" element={<EtudiantConnection />} /> {/* <-- nouvelle route */}
            </Routes>
        </Router>
    );
}

export default App;
