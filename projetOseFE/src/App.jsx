import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/menu/Navbar.jsx";

import { LoginPage } from "./pages/login.jsx";

// Pages Employeur
import { EmployerSignUpPage } from "./pages/employer/signUp.jsx";
import AccueilEmployer from "./pages/employer/accueilEmployer.jsx";
import AjoutStage from "./pages/employer/ajoutStage.jsx";
import { ResetPasswordPage } from "./pages/auth/resetPassword.jsx";
import { RequestPassword } from "./pages/auth/requestPassword.jsx";
import { StudentDashboard } from "./pages/dashboard/studentDashboard.jsx";
import { StudentSignUpPage } from "./pages/student/signUp.jsx";
import Home from "./pages/home.jsx";

function App() {
  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Pages principales */}
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request-password" element={<RequestPassword />} />

          {/* Routes Étudiant */}
          <Route path="/signup/student" element={<StudentSignUpPage />} />

          <Route path="/dashboard/student" element={<StudentDashboard />} />

          {/* Routes Employeur */}
          <Route path="/signup/employer" element={<EmployerSignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employer/accueil" element={<AccueilEmployer />} />
          <Route path="/employer/ajout_stages" element={<AjoutStage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
