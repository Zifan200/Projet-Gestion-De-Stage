import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function AjoutStage() {
  const { t } = useTranslation("employer_dashboard_add_intership");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetedProgramme: "",
    employerEmail: "",
    expirationDate: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = t("errors.title");
    if (!formData.description.trim())
      tempErrors.description = t("errors.description");
    if (!formData.targetedProgramme.trim())
      tempErrors.targetedProgramme = t("errors.targetedProgramme");
    if (!formData.employerEmail.trim())
      tempErrors.employerEmail = t("errors.employerEmail.required");
    else if (!/\S+@\S+\.\S+/.test(formData.employerEmail))
      tempErrors.employerEmail = t("errors.employerEmail.invalid");
    if (!formData.expirationDate)
      tempErrors.expirationDate = t("errors.expirationDate");
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) return;

    try {
      const payload = { ...formData };

      await axios.post(
        "http://localhost:8080/api/v1/employer/create-internship-offer",
        payload,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccessMessage(t("success.message"));
      setFormData({
        title: "",
        description: "",
        targetedProgramme: "",
        employerEmail: "",
        expirationDate: "",
      });
      setErrors({});
    } catch (err) {
      setErrorMessage(t("errors.submission"));
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl mt-5 font-bold">{t("title")}</h1>
      <p className="text-2xl my-5 font-bold">{t("subtitle")}</p>

      {successMessage && (
        <p className="text-lg font-bold text-green-700">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-lg text-center font-bold text-red-700">
          {errorMessage}
          <br />
          {t("errors.emailHint")}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="flex flex-col my-5">
          <label className="text-xl font-semibold mb-2">
            {t("form.title.label")}
          </label>
          <input
            className="border shadow rounded-sm mb-1 px-2 py-2"
            type="text"
            placeholder={t("form.title.placeholder")}
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && (
            <p className="text-md font-bold text-yellow-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col mb-7">
          <label className="text-xl font-semibold mb-2">
            {t("form.description.label")}
          </label>
          <textarea
            className="border shadow rounded-sm mb-1 px-2 py-2"
            name="description"
            placeholder={t("form.description.placeholder")}
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && (
            <p className="text-md font-bold text-yellow-500">
              {errors.description}
            </p>
          )}
        </div>

        {/* Programme */}
        <div className="flex flex-col mb-7">
          <label className="text-xl font-semibold mb-2">
            {t("form.targetedProgramme.label")}
          </label>
          <input
            className="border shadow rounded-sm mb-1 px-2 py-2"
            type="text"
            name="targetedProgramme"
            placeholder={t("form.targetedProgramme.placeholder")}
            value={formData.targetedProgramme}
            onChange={handleChange}
          />
          {errors.targetedProgramme && (
            <p className="text-md font-bold text-yellow-500">
              {errors.targetedProgramme}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col mb-7">
          <label className="text-xl font-semibold mb-2">
            {t("form.employerEmail.label")}
          </label>
          <input
            className="border shadow rounded-sm mb-1 px-2 py-2"
            type="email"
            name="employerEmail"
            placeholder={t("form.employerEmail.placeholder")}
            value={formData.employerEmail}
            onChange={handleChange}
          />
          {errors.employerEmail && (
            <p className="text-md font-bold text-yellow-500">
              {errors.employerEmail}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col mb-7">
          <label className="text-xl font-semibold mb-2">
            {t("form.expirationDate.label")}
          </label>
          <input
            className="border shadow uppercase mb-1 text-gray-700 px-2 py-2 rounded-sm"
            type="date"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
          />
          {errors.expirationDate && (
            <p className="text-md font-bold text-yellow-500">
              {errors.expirationDate}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          className="w-sm cursor-pointer p-4 bg-black rounded-xl text-white text-xl shadow duration-500 hover:border hover:font-semibold hover:text-2xl mb-10 transition-all"
          type="submit"
        >
          {t("form.submit")}
        </button>
      </form>
    </div>
  );
}

