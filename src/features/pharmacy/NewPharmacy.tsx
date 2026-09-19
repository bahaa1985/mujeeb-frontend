import React, { useState } from "react";
import { pharmacyAPI } from "../../api/pharmacyAPI";
import { Modal } from "../../components/ui/Modal";
import { useLanguage } from "../../context/LanguageContext";
import {Button} from "../../components/ui/Button";
import Switch from "@mui/material/Switch";

export const NewPharmacy: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    work_time: "",
    delivery: false,
    delivery_price: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // const { uploadFile, uploading, error } = useSupabaseUpload({
  //   bucketName: "avatars",
  // });

  // const handleAvatarChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   if (event.target.files) {
  //     const file = event.target.files[0];
  //     if (!file) return;
  //     const publicUrl = await uploadFile(file);
  //     if (publicUrl) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         avatar: publicUrl,
  //       }));
  //     }
  //   }
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleDelivery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setFormData({ ...formData, delivery: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("pharmacy.requiredName");
    if (formData.name.length > 50) newErrors.name = t("pharmacy.nameTooLong");
    if (formData.name.length < 9) newErrors.name = t("pharmacy.nameTooShort");
    if (!formData.address.trim())
      newErrors.address = t("pharmacy.requiredAddress");
    if (formData.address.length > 50)
      newErrors.address = t("pharmacy.addressTooLong");
    if (formData.address.length < 5)
      newErrors.address = t("pharmacy.addressTooShort");
    if (!formData.work_time.trim())
      newErrors.work_time = t("pharmacy.requiredWorkTime");
    if (formData.work_time.length > 50)
      newErrors.work_time = t("pharmacy.workTimeTooLong");
    if (formData.work_time.length < 5)
      newErrors.work_time = t("pharmacy.workTimeTooShort");
    if (formData.delivery_price < 0)
      newErrors.delivery_price = "Delivery price cannot be negative";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const newPharmacy = await pharmacyAPI.createPharmacy(
          formData.name,
          formData.address,
          formData.work_time,
          formData.delivery,
          formData.delivery_price,
        );
        setMessage(newPharmacy.pharmacy_name +" " + t("pharmacy.created"));
        setShowSuccessModal(true);
        setFormData({ name: "", address: "", work_time: "", delivery: false, delivery_price: 0 });
      } catch (err) {
        const errMessage =
          err instanceof Error ? err.message : "Regestration failed";
        setMessage(errMessage);
      }
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 dark:bg-slate-900 dark:text-slate-100 rounded-xl shadow-sm border dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">
        {t("pharmacy.addTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-semibold dark:text-slate-200 mb-2">
            {t("pharmacy.name")}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1.5 font-medium">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-semibold dark:text-slate-200 mb-2">
            {t("pharmacy.address")}
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2.5 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1.5 font-medium">
              {errors.address}
            </p>
          )}
        </div>
        {/* <div>
          <label className="block text-sm font-medium mb-1">
            {t("pharmacy.logo")}
          </label>
          <input
            type="file"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
          {uploading && <p>{t("common.uploading")}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div> */}
        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-semibold dark:text-slate-200 mb-2">
            {t("pharmacy.workTime")}
          </label>
          <input
            type="text"
            name="work_time"
            value={formData.work_time}
            onChange={handleChange}
            className="w-full px-4 py-2.5 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {errors.work_time && (
            <p className="text-red-500 text-sm mt-1.5 font-medium">
              {errors.work_time}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <span className="text-sm font-semibold dark:text-slate-200">
              {t("pharmacy.delivery")}
            </span>
            <Switch
              checked={formData.delivery}
              onChange={handleToggleDelivery}
              color="primary"
            />
          </label>
        </div>
        <div className="min-w-[180px] flex-1">
            <label className="block text-sm font-semibold dark:text-slate-200 mb-2">
              {t("pharmacy.deliveryPrice")}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="delivery_price"
              disabled={!formData.delivery}
              value={formData.delivery_price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {errors.delivery_price && (
              <p className="text-red-500 text-sm mt-1.5 font-medium">
                {errors.delivery_price}
              </p>
            )}
          </div>
        <div className="w-full pt-4">
          <Button
            onClick={handleSubmit}
          >
            {t("pharmacy.createButton")}
          </Button>
        </div>
      </form>
      <Modal
        isOpen={showSuccessModal}
        title={message}
        onClose={() => setShowSuccessModal(false)}
        confirmText="OK"
        onConfirm={() => setShowSuccessModal(false)}
      >
        <p>{message}</p>
      </Modal>
    </div>
  );
};
