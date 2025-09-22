import Image from "../../components/ui/image.jsx";
import React from "react";

export const EmployerLoginPage = () => {
    return <div className={"flex"}>
        <Image src={"/assets/img/1.jpg"} className={"w-1/2 max-h-[100vh]"}/>
        <div className={"flex flex-col p-22 m-auto w-4/10 "}>
            <h1 className={"text-5xl mb-10"}>Connection</h1>
        </div>
    </div>
}