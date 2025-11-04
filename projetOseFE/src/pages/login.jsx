import React from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("login");
  const login = useAuthStore((state) => state.login);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success(t("success.loginSuccess"), { duration: 3000 });

      setTimeout(() => {
        if (user.role === "STUDENT") navigate("/dashboard/student");
        if (user.role === "EMPLOYER") navigate("/dashboard/employer");
        if (user.role === "GESTIONNAIRE") navigate("/dashboard/gs");
      }, 1500);
    } catch (e) {
      if (e.response?.status === 500 || e.response?.status === 401) {
        toast.error(t("errors.invalidCredentials"));
      } else {
        toast.error(t("errors.unknown"));
      }
    }
  };

  const onError = () => toast.error(t("errors.fillFields"));

  return (
    <>
      <Toaster position="top-right" />
      <FormTemplate title={t("form.title")} description={t("form.description")}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col"
          >
            <div className="flex flex-col mb-7">
              <Label name="email" label={t("fields.email")} />
              <Input t={t} name="email" placeholder={t("placeholders.email")} />
            </div>

            <div className="flex flex-col mb-2">
              <Label name="password" label={t("fields.password")} />
              <Input
                name="password"
                type="password"
                placeholder={t("placeholders.password")}
                t={t}
              />
            </div>

            <a
              href="/request-password"
              className="hover:text-blue-400 mb-7 transition"
            >
              {t("form.forgetPassword")}
            </a>

            <Button className="p-2" label={t("form.button")} />

            <div className="text-center mt-2 text-zinc-600">
              {t("form.accountNotExist")}{" "}
              <span className="text-blue-400">
                <Link to="/signup/student">{t("form.registerStudent")}</Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
