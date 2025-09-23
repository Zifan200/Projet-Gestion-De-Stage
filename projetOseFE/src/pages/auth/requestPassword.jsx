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
import {requestPasswordSchema} from "../../models/password.js";
import {authService} from "../../services/authService.js";

export const RequestPassword = () => {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(requestPasswordSchema),
        defaultValues: {
            email: "",
        },
    })


    const onSubmit = async (data) => {
        try {
            const res = await authService.requestPasswordChange(data.email)
            if (res.status !== 202) {
                toast.error("Erreur : Utilisateur introuvable.")
                return;
            }
            form.reset()
            toast.success(
                `Un email de changement de mot de passe a été envoyer`,
                { duration: 3000 }
            )
        } catch (err) {
            console.error("❌ Error creating request password:", err)
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
            <h1 className={"text-5xl mb-10 text-black"}>Changé de mot de passe</h1>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
                    <div className={"flex flex-col mb-7"}>
                        <Label name="email" label={"*Entrez votre email"} />
                        <Input name="email"  placeholder="Email" />
                    </div>

                    <button
                        type="submit"
                        onClick={() => console.log("asdf")}
                        className=" p-4 bg-black rounded-xl w-full text-white mt-10 text-xl"
                    >
                        Changer de mot de passe!
                    </button>
                </form>
            </FormProvider>
        </div>

    </div>
}