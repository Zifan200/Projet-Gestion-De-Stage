import Image from "../../components/ui/image.jsx";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import { employerSchema } from "../../models/employer.js";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { Button } from "../../components/ui/button.jsx";
import { api } from "../../lib/api.js";
import { employerService } from "../../services/employerService.js";
import { Toaster, toast } from "sonner";
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

export const EmployerSignUpPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      enterpriseName: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await employerService.register(data);
      form.reset();
      toast.success(
        t("success.registerEnterpriseSuccess", {
          firstName: res.firstName,
          enterpriseName: res.enterpriseName,
        }),
        { duration: 3000 },
      );
      setTimeout(() => {
        navigate("/login");
      }, 4500);
    } catch (err) {
      toast.error(t("errors.genericError"));
    }
  };

  const onError = (err) => {
    toast.error(t("errors.fillFields"));
  };

  return (
    <>
      <FormTemplate
        title={t("form.employer.title")}
        description={t("form.employer.description")}
      >
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
            <div className={"flex flex-col mb-7"}>
              <Label name="email" label={t("form.fields.email")} />
              <Input name="email" placeholder="Email" />
            </div>

            <div className={"flex flex-col mb-7"}>
              <Label name="firstName" label={t("form.fields.firstName")} />
              <Input name="firstName" placeholder="Prénom" />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label name="lastName" label={t("form.fields.lastName")} />
              <Input name="lastName" placeholder="Nom de famille" />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label name="password" label={t("form.fields.password")} />
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder={"Password"}
              />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label
                name="confirmPassword"
                label={t("form.fields.passwordConfirm")}
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Password"
                placeholder={"Password"}
              />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label
                name="enterpriseName"
                label={t("form.employer.enterprise")}
              />
              <Input
                name="enterpriseName"
                type="text"
                label="Password de confirmation"
                placeholder={"Nom de l'entreprise"}
              />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label name="phone" label={t("form.fields.phone")} />
              <Input
                name="phone"
                type="text"
                label="Téléphone de l'entreprise"
                placeholder={"438-999-9999"}
              />
            </div>

            <Button className={"p-2"} label={t("form.createBtn")} />
            <div className={"text-center mt-2 text-zinc-600"}>
              {t("form.login.accountExist")}{" "}
              <span className={"text-blue-400"}>
                <Link to={"/login"}>{t("form.login.title")}</Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
