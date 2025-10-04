import Image from "../../components/ui/image.jsx";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../../components/ui/Input.jsx";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../../components/ui/label.js";
import { api } from "../../lib/api.js";
import { Toaster, toast } from "sonner";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "../../models/password.js";
import { authService } from "../../services/authService.js";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { useTranslation, Trans } from "react-i18next";
import { Button } from "../../components/ui/button.jsx";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    try {
      const res = await authService.resetPasswordChange(token, data.password);
      if (res.status !== 204) {
        toast.error(t("errors.userNotFound"));
        return;
      }
      form.reset();
      toast.success(t("success.passwordChanged"), { duration: 3000 });
      setTimeout(() => {
        navigate("/login");
      }, 4500);
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
        title={t("form.passwordReset.title")}
        description={t("form.passwordReset.description")}
      >
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
            <div className={"flex flex-col mb-7"}>
              <Label name="password" label={t("form.fields.password")} />
              <Input name="password" placeholder="Password" />
            </div>
            <div className={"flex flex-col mb-7"}>
              <Label
                name="confirmPassword"
                label={t("form.fields.passwordConfirm")}
              />
              <Input name="confirmPassword" type="password" placeholder={t("form.fields.passwordConfirm")} />
            </div>

            <Button className={"p-2"} label={t("form.passwordReset.button")} />
            <div className={"text-center mt-2 text-zinc-600"}>
              {" "}
              <span className={"text-blue-400"}>
                <Link to={"/login"}>{t("form.passwordReset.backToLogin")}</Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
