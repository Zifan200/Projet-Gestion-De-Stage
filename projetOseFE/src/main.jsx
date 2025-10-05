import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "sonner";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      toastOptions={{
        style: {
          background: "#B3FE3B",
        },
      }}
      position="top-right"
    />
  </React.StrictMode>,
);
