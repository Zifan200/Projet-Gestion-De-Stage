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
import {programmes, scheduleTypes} from "../../config/app.js";

export default function AddIntership() {
  const { t } = useTranslation("employer_dashboard_add_intership");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const form = useForm({
    resolver: zodResolver(getOfferSchema()),
    defaultValues: {
      title: "",
      description: "",
      salary: "",
      targetedProgramme: "",
      employerEmail: user?.email || "",
      startDate: "",
      endDate: "",
      expirationDate: "",
      session: "",
    },
  });

  const createOffer = useOfferStore((s) => s.createOffer);

  const onSubmit = async (data) => {
    try {
      console.log("Données envoyées:", data);
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
      <div className="max-h-[80vh] overflow-y-auto p-4 flex justify-center">
        <FormTemplate title={t("title")} description={t("description")}>
          <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="w-full max-w-xl flex flex-col gap-6 items-center"
            >
              {/* Title */}
              <div className="w-full">
                <Label name="title" label={t("form.title")} />
                <Input name="title" placeholder={t("form.placeholders.title")} />
              </div>

              {/* Description */}
              <div className="w-full">
                <Label name="description" label={t("form.description")} />
                <Textarea
                    name="description"
                    placeholder={t("form.placeholders.description")}
                />
              </div>

              {/* Program */}
              <div className="flex flex-col w-full">
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

              {/* Salaire */}
              <div className="w-full">
                <Label name="salary" label={t("form.salary")} />
                <div className="flex">
                  <span className={"content-center me-1"}>$</span>
                  <Input
                      name="salary"
                      type="text"
                      placeholder="16.10"
                      {...form.register("salary")}
                  />
                </div>
              </div>

              {/* Type d'horaire */}
              <div className="flex flex-col w-full">
                <Label name="scheduleType" label={t("form.scheduleType")} />
                <select
                    name="scheduleType"
                    {...form.register("typeHoraire")}
                    className="rounded-xl border border-zinc-300 p-3"
                >
                  <option value="">{t("form.placeholders.scheduleType")}</option>
                  {scheduleTypes.map((scheduleType, i) => (
                      <option key={i} value={i}>
                        {t(`form.${scheduleType.toLowerCase()}`)}
                      </option>
                  ))}
                </select>
              </div>

              {/* Nombre d'heures */}
              <div className="w-full">
                <Label name="hourAmount" label={t("form.hourAmount")} />
                <div className="flex">
                  <Input
                      name="hourAmount"
                      type="text"
                      placeholder="40"
                      {...form.register("nbHeures")}
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="w-full">
                <Label name="address" label={t("form.address")} />
                <Input
                    name="address"
                    placeholder={t("form.placeholders.address")}
                    {...form.register("address")}
                />
              </div>

              {/* Start Date */}
              <div className="w-full">
                <Label name="startDate" label={t("form.startDate")}/>
                <Input
                    name="startDate"
                    type="date"
                    {...form.register("startDate")}
                />
              </div>

              {/* End Date */}
              <div className="w-full">
                <Label name="endDate" label={t("form.endDate")} />
                <Input
                    name="endDate"
                    type="date"
                    {...form.register("endDate")}
                />
              </div>

              {/* Deadline */}
              <div className="w-full">
                <Label name="expirationDate" label={t("form.deadline")} />
                <Input
                    name="expirationDate"
                    type="date"
                    {...form.register("expirationDate")}
                />
              </div>

              {/* Submit */}
              <Button className="mt-6 p-2" label={t("submit")} />
            </form>
          </FormProvider>
        </FormTemplate>
      </div>
  );

}
