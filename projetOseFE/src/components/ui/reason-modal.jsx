import React from "react";
import { Modal } from "./modal.jsx";
import { Textarea } from "./textarea.jsx";
import Label from "./label.js";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reasonSchema } from "../../models/reason.js";

export const ReasonModal = ({
  open,
  onClose,
  onSubmit,
  title = "Raison du refus",
  description = "Explique pourquoi tu refuses ce CV.",
  placeholder = "Ex: Le profil ne correspond pas aux exigences du poste...",
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  reasonLabel = "Raison"
}) => {
  const form = useForm({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: "" },
  });

  const handleSubmit = (data) => {
    onSubmit(data.reason);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="default"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <span>{cancelLabel}</span>
          </button>
          <button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
          >
            <span>{confirmLabel}</span>
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
          <div className="flex flex-col gap-2">
            <Label name="reason" label={reasonLabel} />
            <Textarea
              name="reason"
              placeholder={placeholder}
              registration={form.register("reason")}
              error={form.formState.errors.reason?.message}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};