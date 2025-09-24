import Image from "../../components/ui/image.jsx";
import {FormProvider, useForm} from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import {employerSchema} from "../../models/employer.js";
import {zodResolver} from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";
import {api} from "../../lib/api.js";
import {employerService} from "../../services/employerService.js";
import { Toaster, toast } from 'sonner';
import React from "react";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom"

export const EmployerSignUpPage = () => {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(employerSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword : "",
            enterpriseName : "",
            phone : ""
        },
    })


    const onSubmit = async (data) => {
        try {
            const res = await employerService.register(data)
            form.reset()
            toast.success(
                `Bonjour ${res.firstName}, ton compte pour ${res.enterpriseName} a été créé avec succès!`,
                { duration: 3000 }
            )
            setTimeout(() => {
                navigate("/login")
            }, 4500)
        } catch (err) {
            console.error("❌ Error creating employer:", err)
            toast(`❌ Une erreur est survenue veillez réesayer`)
        }
    }

    const onError = (err) => {
        console.log("SUBMIT FAIL ❌", err)
        toast(`Veillez remplir les informations`)
    }


    return <div className={"flex"}>
        <Image src={"/assets/img/1.jpg"} className={"w-1/2 max-h-[100vh]"}/>
        <div className={"flex flex-col p-22 m-auto w-4/10 "}>
            <h1 className={"text-5xl mb-10 text-black"}>Créé un compte pour employer</h1>
            <h4 className={"text-lg text-zinc-500 mb-14"}>Rejoignez <span className="font-semibold">Ose</span> et commencez à publier vos offres de stage pour
                connecter votre entreprise avec les étudiants talentueux.</h4>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
                    <div className={"flex flex-col mb-7"}>
                        <Label name="email" label={"*Entrez votre email"} />
                        <Input name="email"  placeholder="Email" />
                    </div>

                    <div className={"flex flex-col mb-7"}>
                        <Label name="firstName" label={"*Entrez votre Prénom"} />
                        <Input name="firstName"  placeholder="Prénom" />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="lastName" label={"*Entrez votre nom"} />
                        <Input name="lastName"  placeholder="Nom de famille" />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="password" label={"*Entrez votre password"} />
                        <Input name="password" type="password" label="Password" placeholder={"Password"} />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="confirmPassword" label={"*Confirmation de mot de passe"} />
                        <Input name="confirmPassword" type="password" label="Password" placeholder={"Password"} />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="enterpriseName" label={"*Entrez l'entreprise que vous représenter"} />
                        <Input name="enterpriseName" type="text" label="Password de confirmation" placeholder={"Nom de l'entreprise"}/>
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="phone" label={"Numéro de téléphone"} />
                        <Input name="phone" type="text" label="Téléphone de l'entreprise" placeholder={"438-999-9999"}/>
                    </div>

                    <button
                        type="submit"
                        onClick={() => console.log("asdf")}
                        className=" p-4 bg-black rounded-xl w-full text-white mt-10 text-xl"
                    >
                        Créé un compte pour employer!
                    </button>
                    <div className={"text-center mt-2 text-zinc-600"}>Vous avez déja un compte? <span className={"text-blue-400"}><Link to={"/login/employer"}>Log in</Link></span></div>
                </form>
            </FormProvider>
        </div>

    </div>
}