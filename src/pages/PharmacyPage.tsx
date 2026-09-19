import React, { useState, useEffect } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { usePharmacy } from "../context/PharamcyContext";
import { useAuth } from "../context/AuthContext";
import { pharmacyAPI } from "../api/pharmacyAPI";
import { useToast } from "../context/ToastContext";
import { useSupabaseUpload } from "../hooks/useSupabaseUpload";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const PharmacyPage: React.FC = () => {
  const { t } = useLanguage();
  const { pharmacy, setPharmacy } = usePharmacy();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    pharmacy_name: pharmacy?.pharmacy_name || "",
    pharmacy_address: pharmacy?.pharmacy_address || "",
    work_time: pharmacy?.work_time || "",
    logo: pharmacy?.logo || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const { uploadFile, uploading, error } = useSupabaseUpload({
    bucketName: "avatars",
  });

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (!file) return;
      const publicUrl = await uploadFile(file);
      if (publicUrl) {
        setFormData((prev) => ({
          ...prev,
          logo: publicUrl,
        }));
      }
    }
  };

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        pharmacy_name: pharmacy.pharmacy_name,
        pharmacy_address: pharmacy.pharmacy_address,
        work_time: pharmacy.work_time,
        logo: pharmacy.logo || "",
      });
    }
  }, [pharmacy]);

  // Check role: Only role_id 1 (Admin) or 2 (Owner) can view/edit
  if (!user || (user.role_id !== 1 && user.role_id !== 2)) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-slate-400">
            You don't have permission to view this page.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;

    const newErrors: Record<string, string> = {};

    // Restore empty fields to original state before validation if they are empty
    const pharmacyName =
      formData.pharmacy_name.trim() === ""
        ? pharmacy.pharmacy_name
        : formData.pharmacy_name;
    const pharmacyAddress =
      formData.pharmacy_address.trim() === ""
        ? pharmacy.pharmacy_address
        : formData.pharmacy_address;
    const finalWorkTime =
      formData.work_time.trim() === ""
        ? pharmacy.work_time
        : formData.work_time;
    const finalLogo =
      formData.logo.trim() === "" ? pharmacy.logo || "" : formData.logo;

    // Validation on final values
    if (user?.role_id === 1 || user?.role_id === 2) {
      if (!pharmacyName?.trim())
        newErrors.pharmacy_name = t("pharmacy.requiredName");
      if (pharmacyName.length < 9)
        newErrors.pharmacy_name = t("pharmacy.nameTooShort");
      if (pharmacyName.length > 50)
        newErrors.pharmacy_name = t("pharmacy.nameTooLong");
      if (!pharmacyAddress?.trim())
        newErrors.pharmacy_address = t("pharmacy.requiredAddress");
      if (pharmacyAddress.length < 5)
        newErrors.pharmacy_address = t("pharmacy.addressTooShort");
      if (pharmacyAddress.length > 50)
        newErrors.pharmacy_address = t("pharmacy.addressTooLong");
    }
    if (!finalWorkTime.trim()) {
      newErrors.work_time = t("pharmacy.requiredWorkTime");
    } else if (finalWorkTime.length < 5) {
      newErrors.work_time = t("pharmacy.workTimeTooShort");
    } else if (finalWorkTime.length > 50) {
      newErrors.work_time = t("pharmacy.workTimeTooLong");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsUpdating(true);
      try {
        const updatedPharmacy = await pharmacyAPI.updatePharmacy(
          pharmacy.id,
          {
            pharmacy_name: pharmacyName,
            pharmacy_address: pharmacyAddress,
            work_time: finalWorkTime,
            logo: finalLogo,
          },
        );
        setPharmacy(updatedPharmacy);
        setFormData({
          pharmacy_name: updatedPharmacy.pharmacy_name,
          pharmacy_address: updatedPharmacy.pharmacy_address,
          work_time: updatedPharmacy.work_time,
          logo: updatedPharmacy.logo || "",
        });
        showToast(t("pharmacy.updateSuccess"), "success");
      } catch {
        showToast("Failed to update pharmacy info", "error");
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Sync formData with the restored values if there were errors or empty fields
      setFormData({
        pharmacy_name: pharmacyName,
        pharmacy_address: pharmacyAddress,
        work_time: finalWorkTime,
        logo: finalLogo,
      });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8 dark:bg-slate-900 dark:text-slate-100 rounded-3xl p-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-slate-100 tracking-tight">
            {t("pharmacy.updateInfoTitle")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300 mt-2 max-w-2xl">
            {t("pharmacy.updateInfoSubtitle")}
          </p>
        </div>

        <div className="dark:bg-slate-800 shadow-sm rounded-2xl border dark:border-slate-700 p-6 sm:p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pharmacy identity fields are editable by admins and owners. */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("pharmacy.name")}
                </label>
                <Input
                  type="text"
                  value={formData.pharmacy_name}
                  onChange={(e) =>
                    setFormData({ ...formData, pharmacy_name: e.target.value })
                  }
                  disabled={user?.role_id !== 1 && user?.role_id !== 2}
                  // className={`w-full border  rounded-xl py-2.5 px-4  ${user?.role_id !==1 && 'cursor-not-allowed'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("pharmacy.address")}
                </label>
                <Input
                  type="text"
                  value={formData.pharmacy_address}
                  onChange={(e) =>
                    setFormData({ ...formData, pharmacy_address: e.target.value })
                  }
                  disabled={user?.role_id !== 1 && user?.role_id !== 2}
                  // className="w-full border rounded-xl py-2.5 px-4 cursor-not-allowed"
                />
              </div>

              {/* Editable fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {t("pharmacy.workTime")}
                </label>
                <textarea
                  value={formData.work_time}
                  onChange={(e) =>
                    setFormData({ ...formData, work_time: e.target.value })
                  }
                  className={`w-full bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-300 dark:border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.work_time &&
                    "border-red-500 shadow-sm shadow-red-100"
                  }`}
                  rows={3}
                />
                {errors.work_time && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">
                    {errors.work_time}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {t("pharmacy.logo")}
                </label>
                <div className="flex items-center gap-6 p-4 rounded-xl border border-dashed ">
                  <div className="relative group">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="size-20 rounded-full object-cover border-2 border-white shadow-md transition-transform group-hover:scale-105"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/150")
                      }
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      id="logo-upload"
                      onChange={handleLogoChange}
                      disabled={uploading}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border  rounded-lg text-sm font-medium text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors shadow-sm"
                    >
                      {uploading ? t("common.uploading") : t("common.select")}
                    </label>
                    <p className="mt-2 text-xs ">PNG, JPG up to 2MB</p>
                    {error && (
                      <p className="mt-1 text-xs text-red-600">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t ">
              <Button
                type="submit"
                isLoading={isUpdating || uploading}
              >
                {t("common.update")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};
