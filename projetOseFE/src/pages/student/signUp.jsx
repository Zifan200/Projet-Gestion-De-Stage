import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import Input from "../../components/ui/Input.jsx";
import Label from "../../components/ui/label.js";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { Button } from "../../components/ui/button.jsx";
import { studentSchema } from "../../models/student.js";
import { studentService } from "../../services/studentService.js";
import { useTranslation } from "react-i18next";

const programmes = [
  "Technique de l'informatique",
  "Science de la nature",
  "Cinéma",
  "Soins infirmiers",
];

export const StudentSignUpPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      adresse: "",
      program: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await studentService.register(data);
      form.reset();
      toast.success(
        t("success.registerStudentSuccess", {
          firstName: res.firstName,
          program: res.program,
        }),
        { duration: 3000 },
      );
      setTimeout(() => navigate("/login"), 3500);
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
        title={t("form.student.title")}
        description={t("form.student.description")}
      >
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="">
            <div className="flex flex-col mb-7">
              <Label name="firstName" label={t("form.fields.firstName")} />
              <Input
                name="firstName"
                placeholder={t("form.fields.firstName")}
              />
            </div>

            <div className="flex flex-col mb-7">
              <Label name="lastName" label={t("form.fields.lastName")} />
              <Input name="lastName" placeholder={t("form.fields.lastName")} />
            </div>

            <div className="flex flex-col mb-7">
              <Label name="email" label={t("form.fields.email")} />
              <Input name="email" placeholder={t("form.fields.email")} />
            </div>

            <div className="flex flex-col mb-7">
              <Label name="phone" label={t("form.fields.phone")} />
              <Input name="phone" placeholder={t("form.fields.phone")} />
            </div>

            <div className="flex flex-col mb-7">
              <Label name="adresse" label={t("form.student.adress")} />
              <Input name="adresse" placeholder={t("form.student.adress")} />
            </div>

            <div className="flex flex-col mb-7">
              <Label name="program" label={t("form.student.programmes")} />
              <select
                name="program"
                {...form.register("program")}
                className="rounded-xl border border-zinc-300 p-3"
              >
                <option value="">{t("form.student.selectProgram")}</option>
                {programmes.map((prog, i) => (
                  <option key={i} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mb-7">
              <Label name="password" label={t("form.fields.password")} />
              <Input
                name="password"
                type="password"
                placeholder={t("form.fields.password")}
              />
            </div>

            <div className="flex flex-col mb-7">
              <Label
                name="confirmPassword"
                label={t("form.fields.passwordConfirm")}
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder={t("form.fields.passwordConfirm")}
              />
            </div>

            <Button className={"p-2"} label={t("form.createBtn")} />

            <div className="text-center mt-2 text-zinc-600">
              {t("form.login.accountExist")}{" "}
              <span className="text-blue-400">
                <Link to="/login">{t("form.login.title")}</Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </FormTemplate>
    </>
  );
};
