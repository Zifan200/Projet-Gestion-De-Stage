import React, { useEffect } from 'react'
import { BrowserRouter,Routes,  Route, Link } from "react-router-dom";
import {EmployerCreationPage} from "./pages/employer/creation.jsx";


function App() {
    return (
        <BrowserRouter>

            <Routes>
                <Route path="/" element={<h1 className="p-4">Welcome Home 🚀</h1>} />
                <Route path="/employer/create" element={<EmployerCreationPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App