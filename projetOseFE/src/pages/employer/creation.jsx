import Image from "../../components/ui/image.jsx";
import {FormProvider, useForm} from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import {employerSchema} from "../../models/employer.js";
import {zodResolver} from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";

export function EmployerCreationPage() {
    const form = useForm({
        resolver: zodResolver(employerSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
        },
    })

    const onSubmit = (e) => {
        console.log(e)
    }


    return <div className={"flex"}>
        <Image src={"/assets/img/1.jpg"} className={"w-1/2 max-h-[100vh]"}/>
        <div className={"flex flex-col p-22 m-auto w-4/10 "}>
            <h1 className={"text-5xl mb-10"}>Créé un compte pour employer</h1>
            <h4 className={"text-lg text-zinc-500 mb-14"}>Rejoignez <span className="font-semibold">Ose</span> et commencez à publier vos offres de stage pour
                connecter votre entreprise avec les étudiants talentueux.</h4>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
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
                        <Label name="password" label={"*Confirmation de mot de passe"} />
                        <Input name="confirmPassword" type="confirmPassword" label="Password" placeholder={"Password"} />
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="enterprise" label={"*Entrez l'entreprise que vous représenter"} />
                        <Input name="enterprise" type="text" label="Password de confirmation" placeholder={"Nom de l'entreprise"}/>
                    </div>
                    <div className={"flex flex-col mb-7"}>
                        <Label name="enterprise" label={"Numéro de téléphone"} />
                        <Input name="enterprise" type="text" label="Téléphone de l'entreprise" placeholder={"438-999-9999"}/>
                    </div>

                    <button
                        type="submit"
                        className=" p-4 bg-black rounded-xl w-full text-white mt-10 text-xl"
                    >
                        Créé un compte pour employer!
                    </button>
                </form>
            </FormProvider>
        </div>
    </div>
}