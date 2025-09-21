import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EtudiantForm from "./components/EtudiantForm";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inscription-etudiant" element={<EtudiantForm />} />
            </Routes>
        </Router>
    );
}

export default App;
