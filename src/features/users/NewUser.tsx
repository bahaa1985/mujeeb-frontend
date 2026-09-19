import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/userAPI";
import { Modal } from "../../components/ui/Modal";
import { pharmacyAPI } from "../../api/pharmacyAPI";
import type { Pharmacy } from "../../types/pharmacy";
import { useLanguage } from "../../context/LanguageContext";
import {Button} from "../../components/ui/Button";

export const NewUser: React.FC = () => {
  const currentUser = useAuth().user;
  const { t } = useLanguage();
  // const { uploadFile, uploading, error } = useSupabaseUpload({
  //   bucketName: "avatars",
  // });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    avatar: "",
    password: "",
    confirmPassword: "",
    roleId: 2,
    instance_name: "",
  });

  const [pharmacies, setPharamacies] = useState<Pharmacy[]>([]);
  const [pharmacyId, setPharmacyId] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const getPharmaciesAsync = async () => {
      const pharmacies = await pharmacyAPI.getPharmacies();
      setPharamacies(pharmacies);
    };
    if (currentUser?.role_id.toString() === "1") {
      getPharmaciesAsync();
    }
  }, [currentUser?.role_id]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const newErrors: Record<string, string> = {};
      if (!formData.firstName.trim())
        newErrors.firstName = t("users.requiredFirstName");
      // if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.mobile.trim()) newErrors.mobile = t("users.requiredMobile");
      if (formData.mobile.length != 12)
        newErrors.mobile = t("users.invalidMobile");
      if (!formData.password) newErrors.password = t("users.requiredPassword");
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("users.passwordMismatch");
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        console.log("Form submitted:", formData);
        // TODO: API call to register user
        await userAPI.register({
          mobile: formData.mobile,
          password: formData.password,
          username: formData.firstName,
          avatar: formData.avatar,
          role_id: formData.roleId,
          pharmacy_id:
            currentUser?.role_id.toString() === "1"
              ? pharmacyId
              : currentUser?.pharmacy_id || 0,
          instance_name: formData.instance_name + "_" + formData.mobile,
        });
        setMessage(t("users.success"));
        setShowSuccessModal(true);
        setFormData({
          firstName: "",
          lastName: "",
          mobile: "",
          avatar: "",
          password: "",
          confirmPassword: "",
          roleId: 2,
          instance_name: "",
        });
      }
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Registration failed";
      setMessage(errMessage);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 dark:bg-slate-800 dark:text-slate-100 rounded-3xl border dark:border-slate-700 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">{t("users.registerTitle")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentUser?.role_id.toString() === "1" ? (
          <div>
            <label className="after:content-['*'] after:m-0.5 after:text-red-500 block text-sm font-medium dark:text-slate-200 mb-1">
              {t("users.pharmacy")}
            </label>
            <select
              name="pharmacyId"
              value={pharmacyId}
              onChange={(e) => setPharmacyId(Number(e.target.value))}
              className="w-full px-3 py-2 dark:bg-slate-900 dark:dark:text-slate-100 border dark:border-slate-700 rounded"
            >
              <option value={0}>{t("users.selectPharmacy")}</option>
              {pharmacies?.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.pharmacy_name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-500 block text-sm font-medium dark:dark:text-slate-200 mb-1">
            {t("users.firstName")}
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:dark:bg-slate-900 dark:dark:text-slate-100 border dark:border-slate-700 rounded"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium dark:dark:text-slate-200 mb-1">
            {t("users.lastName")}
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:dark:bg-slate-900 dark:dark:text-slate-100 border dark:border-slate-700 rounded"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-medium dark:dark:text-slate-200 mb-1">
            {t("users.mobile")}
          </label>
          <input
            type="number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:dark:bg-slate-900 dark:dark:text-slate-100 border dark:border-slate-700 rounded"
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* <div>
          <label className="block text-sm font-medium mb-1">
            {t("users.avatar")}
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
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-medium dark:text-slate-200 mb-1">
            {t("users.password")}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-medium dark:text-slate-200 mb-1">
            {t("users.confirmPassword")}
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700 rounded"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <label className="after:content-['*'] after:m-0.5 after:text-red-700 block text-sm font-medium dark:text-slate-200 mb-1">
            {t("users.role")}
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="w-full px-3 py-2 dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700 rounded"
          >
            <option value={2}>{t("users.owner")}</option>
            <option value={3}>{t("users.pharmacist")}</option>
            <option value={4}>{t("users.delivery")}</option>
          </select>
        </div>
<div className="w-full">
<Button onClick={handleSubmit}>
 {t("users.registerButton")}
</Button>
</div>

        {/* <button
          type="submit"
          className="w-full sm:w-1/2 px-8 sm:px-auto py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 shadow-sm"
        >
          {t("users.registerButton")}
        </button> */}
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
