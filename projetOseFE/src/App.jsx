import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/menu/Navbar.jsx";
import ConnectionForm from "./components/ConnectionForm.jsx";

// Pages Étudiant
import Home from "./components/Home.jsx";
import EtudiantForm from "./components/EtudiantForm.jsx";
import EtudiantConnection from "./components/EtudiantConnection.jsx";

// Pages Employeur
import { EmployerSignUpPage } from "./pages/employer/signUp.jsx";
import { EmployerLoginPage } from "./pages/employer/login.jsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Home />} />

                {/* Routes Étudiant */}
                <Route path="/signup/etudiant" element={<EtudiantForm />} />
                {/*<Route path="/login/etudiant" element={<EtudiantConnection />} />*/}
                <Route path="/login/etudiant" element={<ConnectionForm />} />

                {/* Routes Employeur */}
                <Route path="/signup/employer" element={<EmployerSignUpPage />} />
                <Route path="/login/employer" element={<EmployerLoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
