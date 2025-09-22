import { useFormContext } from 'react-hook-form'
import {cn} from "../../lib/cn.js";



function Input({ name, type = 'text', placeholder, className }) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error = errors[name]?.message

    return <>
        <input className={cn(
            "border shadow-md outline-none rounded-md border-zinc-300 pl-3 pr-3 pt-2 pb-2 min-w-[250px] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            className
        )} id={name} type={type} {...register(name)} placeholder={placeholder} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
}

export default Input;