import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import { offerSchema } from "../../models/offer.js";
import Label from "../../components/ui/label.js";
import Input from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/textarea.jsx";
import { Button } from "../../components/ui/button.jsx";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { programmes } from "../../config/app.js";

export default function AddIntership() {
  const { t } = useTranslation("employer_dashboard_add_intership");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const form = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      targetedProgramme: "",
      employerEmail: user?.email || "",
      expirationDate: "",
    },
  });

  const createOffer = useOfferStore((s) => s.createOffer);

  const onSubmit = async (data) => {
    try {
      await createOffer(token, data);
      toast.success(t("success.create"));
      form.reset();
    } catch (err) {
      toast.error(t("errors.create"));
    }
  };

  const onError = () => {
    toast.error(t("errors.fillFields"));
  };

  return (
    <div>
      <FormTemplate title={t("title")} description={t("description")}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="w-full max-w-xl flex flex-col gap-6"
          >
            {/* Title */}
            <div>
              <Label name="title" label={t("form.title")} />
              <Input name="title" placeholder={t("form.placeholders.title")} />
            </div>

            {/* Description */}
            <div>
              <Label name="description" label={t("form.description")} />
              <Textarea
                name="description"
                placeholder={t("form.placeholders.description")}
              />
            </div>

            {/* Program */}
            <div className="flex flex-col">
              <Label name="targetedProgramme" label={t("form.program")} />
              <select
                name="targetedProgramme"
                {...form.register("targetedProgramme")}
                className="rounded-xl border border-zinc-300 p-3"
              >
                <option value="">{t("form.placeholders.program")}</option>
                {programmes.map((prog, i) => (
                  <option key={i} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <Label name="expirationDate" label={t("form.deadline")} />
              <Input name="expirationDate" type="date" />
            </div>

            {/* Submit */}
            <Button className="mt-6 p-2" label={t("submit")} />
          </form>
        </FormProvider>
      </FormTemplate>
    </div>
  );
}
