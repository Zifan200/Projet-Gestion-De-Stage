import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router";
import { authService } from "../services/authService.js";
import { useTranslation, Trans } from "react-i18next";
import { FormTemplate } from "../components/ui/form-template.jsx";
import { Button } from "../components/ui/button.jsx";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../models/login.js";
import Label from "../components/ui/label.js";
import Input from "../components/ui/Input.jsx";
import useAuthStore from "../stores/authStore.js";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success(t("success.loginSucces"), { duration: 3000 });
      setTimeout(() => {
        if (user.role === "STUDENT") navigate("/dashboard/student");
        if (user.role === "EMPLOYER") navigate("/dashboard/employer");
      }, 1500);
    } catch (e) {
      if (e.response?.status === 500 || e.response?.status === 401) {
        toast.error(t("errors.invalidCredentials"));
      } else {
        toast.error("Erreur inconnue");
      }
    }
  };

  const onError = (err) => {
    console.log(err);
    toast.error(t("errors.fillFields"));
  };

  return (
    <>
      <FormTemplate
        title={t("form.login.title")}
        description={t("form.login.description")}
      >
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col"
          >
            <div className={"flex flex-col mb-7"}>
              <Label name="email" label={t("form.fields.email")} />
              <Input name="email" placeholder="Email" />
            </div>

            <div className={"flex flex-col mb-2"}>
              <Label name="password" label={t("form.fields.password")} />
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder={"Password"}
              />
            </div>
            <a
              href="/request-password"
              className="hover:text-blue-400 mb-7 transition "
            >
              {t("form.login.forgetPassword")}
            </a>
            <Button className={"p-2"} label={t("form.login.button")} />
            <div className={"text-center mt-2 text-zinc-600"}>
              {t("form.register.accountNotExist")}{" "}
              <span className={"text-blue-400"}>
                <Link to={"/signup/student"}>{t("form.student.title")}</Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
