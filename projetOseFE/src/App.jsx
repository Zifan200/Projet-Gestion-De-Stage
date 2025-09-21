import React, { useEffect } from 'react'
import { BrowserRouter,Routes,  Route, Link } from "react-router-dom";
import { EmployerSignUpPage} from "./pages/employer/signUp.jsx";
import {MegaMenu} from "./components/menu/Menu.jsx";
import Navbar from "./components/menu/Navbar.jsx";
import {EmployerLoginPage} from "./pages/employer/login.jsx";


function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<h1 className="p-4">Welcome Home 🚀</h1>} />
                <Route path="/signup/employer" element={<EmployerSignUpPage />} />
                <Route path="/login/employer" element={<EmployerLoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App