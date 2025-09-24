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
import {ResetPasswordPage} from "./pages/auth/resetPassword.jsx";
import {RequestPassword} from "./pages/auth/requestPassword.jsx";
import {StudentDashboard} from "./pages/dashboard/studentDashboard.jsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Home />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/request-password" element={<RequestPassword />} />

                {/* Routes Étudiant */}
                <Route path="/signup/etudiant" element={<EtudiantForm />} />
                <Route path="/dashboard/student" element={<StudentDashboard />} />

                {/* Routes Employeur */}
                <Route path="/signup/employer" element={<EmployerSignUpPage />} />
                <Route path="/login" element={<ConnectionForm />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
