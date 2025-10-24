import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import { getOfferSchema } from "../../models/offer.js";
import Label from "../../components/ui/label.js";
import Input from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/textarea.jsx";
import { Button } from "../../components/ui/button.jsx";
import { FormTemplate } from "../../components/ui/form-template.jsx";
import { programmes } from "../../config/app.js";

export default function AddIntership() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const form = useForm({
    resolver: zodResolver(getOfferSchema()),
    defaultValues: {
      title: "",
      description: "",
      targetedProgramme: "",
      employerEmail: user.email,
      expirationDate: "",
      dateDebut: "",
      dateFin: "",
      session: "",
    },
  });

  const createOffer = useOfferStore((s) => s.createOffer);

  const onSubmit = async (data) => {
    try {
      await createOffer(token, data);
      toast.success(t("offer.success.create"));
      form.reset();
    } catch (err) {
      toast.error(t("offer.error.create"));
    }
  };

  const onError = (err) => {
    console.log(err);
    toast.error(t("errors.fillFields"));
  };

  const dateDebut = form.watch("dateDebut");

  return (
      <div>
        <FormTemplate
            title={t("offer.title")}
            description={t("offer.description")}
        >
          <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="w-full max-w-xl flex flex-col gap-6"
            >
              <div>
                <Label name="title" label={t("offer.form.title")} />
                <Input
                    name="title"
                    placeholder={t("offer.form.placeholders.title")}
                />
              </div>

              <div>
                <Label name="description" label={t("offer.form.description")} />
                <Textarea
                    name="description"
                    placeholder={t("offer.form.placeholders.description")}
                />
              </div>

              <div className="flex flex-col">
                <Label name="targetedProgramme" label={t("offer.form.program")} />
                <select
                    name="targetedProgramme"
                    {...form.register("targetedProgramme")}
                    className="rounded-xl border border-zinc-300 p-3"
                >
                  <option value="">{t("offer.form.placeholders.program")}</option>
                  {programmes.map((prog, i) => (
                      <option key={i} value={prog}>
                        {prog}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <Label name="dateDebut" label={t("offer.form.startDate")} />
                <Input
                    name="dateDebut"
                    type="date"
                    {...form.register("dateDebut")}
                />
              </div>

              <div>
                <Label name="dateFin" label={t("offer.form.endDate")} />
                <Input
                    name="dateFin"
                    type="date"
                    {...form.register("dateFin")}
                />
                
              </div>

              <div>
                <Label name="expirationDate" label={t("offer.form.deadline")} />
                <Input
                    name="expirationDate"
                    type="date"
                    {...form.register("expirationDate")}
                />
              </div>

              <Button className="mt-6 p-2" label={t("offer.submit")} />
            </form>
          </FormProvider>
        </FormTemplate>
      </div>
  );
}
