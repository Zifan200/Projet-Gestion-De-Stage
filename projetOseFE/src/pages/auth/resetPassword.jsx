import Image from "../../components/ui/image.jsx";
import {FormProvider, useForm} from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import {zodResolver} from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";
import {api} from "../../lib/api.js";
import { Toaster, toast } from 'sonner';
import React from "react";
import {Link, useSearchParams} from "react-router-dom";
import { useNavigate } from "react-router-dom"
import { resetPasswordSchema} from "../../models/password.js";
import {authService} from "../../services/authService.js";

export const ResetPasswordPage = () => {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })
    const [searchParams, setSearchParams] = useSearchParams();
    const token = searchParams.get("token")


    const onSubmit = async (data) => {
        try {
            const res = await authService.resetPasswordChange(token, data.password)
            if (res.status !== 204) {
                toast.error("Une erreur est survenue")
                return;
            }
            form.reset()
            toast.success(
                `Mot de passe changé avec succès!`,
                { duration: 3000 }
            )
            setTimeout(() => {
                navigate("/login")
            }, 4500)
        } catch (err) {
            console.error("❌ Error creating request password:", err)
            toast(`❌ Une erreur est survenue veillez réesayer`)
        }
    }

    const onError = (err) => {
        console.log("SUBMIT FAIL ❌", err)
        toast(`Veuillez remplir les informations`)
    }


    return <div className={"flex"}>
        <Image src={"/assets/img/1.jpg"} className={"w-1/2 max-h-[100vh]"}/>
        <div className={"flex flex-col p-22 m-auto w-4/10 "}>
            <h1 className={"text-5xl mb-10 text-black"}>Changé de mot de passe</h1>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
                    <div className={"flex flex-col mb-7"}>
                        <Label name="password" label={"*Entrez un nouveau mot de passe"} />
                        <Input name="password" type={"password"}  placeholder="Password" />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="confirmPassword" label={"*Confirmer un nouveau mot de passe"} />
                        <Input name="confirmPassword" type={"password"} placeholder="Confirm password" />
                    </div>

                    <button
                        type="submit"
                        onClick={() => console.log("asdf")}
                        className=" p-4 bg-black rounded-xl w-full text-white mt-10 text-xl"
                    >
                        Changer de mot de passe maintenant!
                    </button>
                </form>
            </FormProvider>
        </div>

    </div>
}