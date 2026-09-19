import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/userAPI";
import type { User } from "../types/user";
import { useLanguage } from "../context/LanguageContext";
import { useSupabaseUpload } from "../hooks/useSupabaseUpload";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Modal } from "../components/ui/Modal";

import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const UserPage: React.FC = () => {
  const currentUser = useAuth().user;
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [updatedUser, setUpdatedUser] = useState<User>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { uploadFile, uploading, error } = useSupabaseUpload({
        bucketName: "avatars",
      });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    mobile: currentUser?.mobile || "",
    avatar: currentUser?.avatar,
    password: "",
    confirmPassword: "",
  });

  const handleAvatarChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (event.target.files) {
        const file = event.target.files[0];
        if (!file) return;
        const publicUrl = await uploadFile(file);
        if (publicUrl) {
          setFormData((prev) => ({
            ...prev,
            avatar: publicUrl,
          }));
        }
      }
    };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const newErrors: Record<string, string> = {};
      if (!formData.username.trim())
        newErrors.username = t("users.requiredUserName");
      if (formData.username.length < 3)
        newErrors.username = t("users.invalidUserName");
      if (!formData.mobile.trim()) newErrors.mobile = t("users.requiredMobile");
      if (formData.mobile.length != 12)
        newErrors.mobile = t("users.invalidMobile");
      // if (!formData.password) newErrors.password = t("users.requiredPassword");
      if (formData.password.length < 8 && formData.password.length > 0)
        newErrors.password = t("users.passwordTooShort");
      if (formData.password.length > 20)
        newErrors.password = t("users.passwordtTooLong");
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = t("users.passwordMismatch");
      setErrors(newErrors);
      console.log("errors", newErrors);

      if (Object.keys(newErrors).length == 0) {
        setFormData({
          username: formData.username,
          mobile: formData.mobile,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          avatar: formData.avatar,
        });
        setUpdatedUser(
          await userAPI.updateUser(currentUser?.id || 0, formData),
        );
        setShowSuccessModal(true);
        return updatedUser;
      }
    } catch (error) {
      const err = error as Error;
      console.log(err)
      setShowSuccessModal(false);
      setMessage(t("users.failedUpdate"));
    }
  };
  return (
        <PageWrapper>
          <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2 dark:text-white">{t("users.title")}</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">{t("users.subtitle")}</p>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <Input
                label={t("users.username")}
                type="text"
                name="username"
                value={formData.username}
                maxLength={30}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                error={errors.username}
              />

              {currentUser?.role_id == 1 ||
                (currentUser?.role_id == 2 && (
                  <Input
                    label={t("users.mobile")}
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    error={errors.mobile}
                  />
                ))}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  {t("users.avatar")}
                </label>
                <input
                  type="file"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 dark:text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-slate-800 dark:file:text-blue-400
                    hover:file:bg-blue-100 dark:hover:file:bg-slate-700"
                />
                {uploading && <p className="text-sm text-blue-500 mt-1">{t("common.uploading") || "Uploading..."}</p>}
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
              <Input
                label={t("users.password")}
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
              />
              <Input
                label={t("users.confirmPassword")}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                error={errors.confirmPassword}
              />
              <Button
                type="submit"
                fullWidth
                isLoading={uploading}
              >
                {t("users.updateSettingsTitle")}
              </Button>
            </form>
            {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            <Modal
              isOpen={showSuccessModal}
              title={t("users.updateSuccess")}
              onClose={() => setShowSuccessModal(false)}
              confirmText={t("common.ok") || "OK"}
              onConfirm={() => {
                setShowSuccessModal(false);
                navigate("/login");
              }}
            >
              <p className="dark:text-slate-300">{message || t("users.updateSuccess")}</p>
            </Modal>
          </div>
        </PageWrapper>
  );
};
