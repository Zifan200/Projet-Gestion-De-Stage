import { useFormContext } from 'react-hook-form'
import {cn} from "../../lib/cn.js";



function Label({ name, label, className }) {
    const {
        register,
        formState: { errors },
    } = useFormContext()

    return <>
        <label className={cn(
            "mb-2 text-zinc-600",
            className
        )} id={name} {...register(name)} >{label}</label>
    </>
}

export default Label;