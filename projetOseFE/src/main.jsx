import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import EtudiantForm from "./components/EtudiantForm.jsx";
import ConnectionForm from "./components/ConnectionForm.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        {/*<EtudiantForm />*/}
        <ConnectionForm />
    </React.StrictMode>
);
