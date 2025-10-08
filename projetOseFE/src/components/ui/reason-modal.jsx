import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormTemplate } from "./form-template.jsx";
import { Button } from "./button.jsx";
import { Textarea } from "./textarea.jsx";
import Label from "./label.js";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reasonSchema } from "../../models/reason.js";

export const ReasonModal = ({ open, onClose, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: "" },
  });

  const handleSubmit = (data) => {
    onSubmit(data.reason);
    form.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-white backdrop-blur-xl flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="min-w-[1000px]">
            <FormTemplate
              title="Raison du refus"
              description="Explique pourquoi tu refuses ce CV."
            >
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-2">
                    <Label name="reason" label="Raison" />
                    <Textarea
                      name="reason"
                      placeholder="Ex: Le profil ne correspond pas aux exigences du poste..."
                      registration={form.register("reason")}
                      error={form.formState.errors.reason?.message}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      label="Annuler"
                      className="bg-zin-300 hover:bg-gray-500"
                      type="button"
                      onClick={() => {
                        form.reset();
                        onClose();
                      }}
                    />
                    <Button label="Confirmer" className="" type="submit" />
                  </div>
                </form>
              </FormProvider>
            </FormTemplate>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
