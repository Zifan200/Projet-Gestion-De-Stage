import React, {useState} from "react";
import {Link} from "react-router-dom";
import { Toaster, toast } from 'sonner';
import {useNavigate} from "react-router";
import AccueilEmployer from "../pages/employer/accueilEmployer.jsx";
import EtudiantConnection from "./EtudiantConnection.jsx";
import {authService} from "../services/authService.js";

export default function ConnectionForm() {
    const api = "http://localhost:8080/user/signin";
    const userInfos = "http://localhost:8080/user/me";
    const navigate = useNavigate();

    const passwordMinSize = 8;
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailValid() || !isPasswordValid()) {
            setErrors("Courriel ou mot de passe invalide");
            console.log("errors", formData.email, formData.password)
            return;
        } else {
            setErrors("");
            console.log("connexion", formData.email, formData.password)
        }
        await fetchUser();
    };

    const fetchUser = async () => {
        try {
            const response = await fetch(api, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: formData.email.toLowerCase(),
                    password: formData.password
                })
            });

            if (response.ok) {
                const token = await response.json();
                localStorage.setItem("token", token.accessToken);
                if (token) {
                    const data = await authService.getMe(token.accessToken);
                    if (data.role === "STUDENT") {
                        navigate("/dashboard/student")
                    }
                }
                toast.info("Connexion réussie")

                const userResponse = await fetch(userInfos, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                });

                if (userResponse.ok) {
                    const user = await userResponse.json();
                    console.log(user);

                    if (user.role === "EMPLOYER") {
                        navigate("/employer/accueil");
                    }
                    else if (user.role === "STUDENT") {
                        navigate("/dashboard/student");
                    }
                }
                else {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
            else if (response.status === 401) {
              
                setErrors("Erreur de validation");
            } else {
                setErrors("Une erreur est survenue");
            }
        } catch (error) {
            setErrors("Une erreur est survenue");
        }
    }

    const handleChanges = (e) => {
        e.preventDefault();
        const {name, value} = e.target;

        setFormData({...formData, [name]: value.trim()});
        setErrors("");
    }

    const isEmailValid = () => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(formData.email);
    }

    const isPasswordValid = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
        return passwordRegex.test(formData.password);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 dark:bg-gray-800">
            <form onSubmit={handleSubmit}
                  className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
                    Connexion
                </h2>

                <div className="pb-4">
                    <label className="block">Courriel : </label>
                    <input
                        type="email" name="email" onChange={handleChanges} placeholder="example@email.com" required
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none
                            focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="pb-4">
                    <label className="block">Mot de passe : </label>
                    <input type="password" name="password" onChange={handleChanges}
                           minLength={passwordMinSize} required
                           className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none
                            focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {errors &&
                    <p className="text-red-500 text-sm mt-1 font-semibold pb-4">{errors}</p>
                }

                <button type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Se connecter
                </button>
                <div className={"text-center mt-2 text-zinc-600"}>Mot de passe oublié ?
                    <span className={"text-blue-400"}>
                    <Link to={"/request-password"}> Cliquez ici</Link>
                    </span>
                </div>
            </form>
        </div>
    );
}

