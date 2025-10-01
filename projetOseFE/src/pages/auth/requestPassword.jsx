import Image from "../../components/ui/image.jsx";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/button.jsx";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { employerSchema } from "../../models/employer.js";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";
import { api } from "../../lib/api.js";
import { employerService } from "../../services/employerService.js";
import { Toaster, toast } from "sonner";
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { requestPasswordSchema } from "../../models/password.js";
import { authService } from "../../services/authService.js";
import { useTranslation, Trans } from "react-i18next";

export const RequestPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(requestPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await authService.requestPasswordChange(data.email);
      if (res.status !== 202) {
        toast.error(t("errors.userNotFound"));
        return;
      }
      form.reset();
      toast.success(t("success.emailSent"), { duration: 3000 });
    } catch (err) {
      toast(t("errors.genericError"));
    }
  };

  const onError = (err) => {
    toast(t("errors.fillFields"));
  };

  return (
    <>
      <FormTemplate
        title={t("form.passwordRequest.title")}
        description={t("form.passwordRequest.description")}
      >
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
            <div className={"flex flex-col mb-7"}>
              <Label name="email" label={t("form.fields.email")} />
              <Input name="email" placeholder="Email" />
            </div>

            <Button className="p-2" label={t("form.passwordRequest.button")} />
            <div className={"text-center mt-2 text-zinc-600"}>
              {" "}
              <span className={"text-blue-400"}>
                <Link to={"/login"}>
                  {t("form.passwordRequest.backToLogin")}
                </Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
