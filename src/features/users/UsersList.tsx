import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/userAPI";
import { pharmacyAPI } from "../../api/pharmacyAPI";
import { evolutionAPI } from "../../api/evolutionAPI";
import { Modal } from "../../components/ui/Modal";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import type { User } from "../../types/user";
import type { Pharmacy } from "../../types/pharmacy";
import Switch from "@mui/material/Switch";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Store as StoreIcon,
  // Badge as BadgeIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

export const UsersList: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [pharmacies, setPharamacies] = useState<Pharmacy[]>([]);
  const [pharmacyId, setPharmacyId] = useState(user?.pharmacy_id || 0);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  // const [instanceName, setInstanceName] = useState(
  //   selectedUser?.instance_name || selectedUser?.username + "_" + selectedUser?.id);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  // const [qrCodeVisible, setQrCodeVisible] = useState(false);
  // const [qrCodeTimer, setQrCodeTimer] = useState<number>(0);
  // const [qrCodeIntervalId, setQrCodeIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let interval: number;
    if (selectedUser?.instance_status !== "open") {
      interval = setInterval(async () => {
        try {
          const updatedUsers = await userAPI.getUsers(pharmacyId);
          if (updatedUsers) {
            setUsers(updatedUsers);
            const currentUser = updatedUsers.find(
              (u) => u.id.toString() === selectedUser?.id.toString(),
            );
            if (
              currentUser &&
              currentUser.instance_status === "open" &&
              selectedUser?.instance_status !== "open"
            ) {
                            setSelectedUser(currentUser);
              showToast(t("users.whatsapp.connected"), "success");
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedUser, pharmacyId, t]);

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && pairingCode) {
      setPairingCode(null);
    }
    return () => clearInterval(interval);
  }, [timer, pairingCode]);

  useEffect(() => {
    const getPharmaciesAsync = async () => {
      const pharmacies = await pharmacyAPI.getPharmacies();
      setPharamacies(pharmacies);
    };
    if (user?.role_id.toString() === "1") getPharmaciesAsync();
  }, [user?.role_id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getUsers(pharmacyId);
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [pharmacyId]);

  const handlePharmacyClick = (pharmacyId: number) => {
    setPharmacyId(pharmacyId);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setModalTitle(`${user.username}'s ${t("common.details") || "Details"}`);
    setPairingCode(null);
    setTimer(0);
    setShowModal(true);
  };

  const handleConnectWhatsApp = async () => {
    if (!selectedUser) return;
    setConnecting(true);
    try {
      if (selectedUser.instance_name===null) {
        await evolutionAPI.createInstance(selectedUser.id
          ,selectedUser?.username + "_" + selectedUser?.id,
          selectedUser.mobile,
        );
        setSelectedUser({
          ...selectedUser,
          instance_name: selectedUser?.username + "_" + selectedUser?.id,
      })
      }
      setTimer(2);
      //get pairing code and qr code
      const pairingData = await evolutionAPI.getPairingCode(
        selectedUser?.username + "_" + selectedUser?.id,
      );
            if (pairingData) {
        setPairingCode(pairingData.pairingCode);
        if (!pairingCode) setQrCode(pairingData.base64);
        setTimer(60); // 1 minute
      } else {
        showToast(t("users.whatsapp.failedToGetPairingCode"), "error");
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      showToast(t("users.whatsapp.errorConnecting"), "error");
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    // لو مش محتاجين نفحص، اخرج فوراً
    console.log("selectedUser?.instance_name", selectedUser?.instance_name)
    if (
      !selectedUser ||
      (selectedUser.instance_status === "open" &&
        selectedUser.instance_name !== null || selectedUser.instance_name !== undefined)
    )
      return;
    const interval = setInterval(async () => {
      try {
        const connectionState = await evolutionAPI.getConnectionState(
          selectedUser?.instance_name
        );

                if (connectionState === "open") {
          showToast(t("users.whatsapp.connected"), "success");

          // استخدام Functional update لأمان أكبر
          setSelectedUser((prevUser) =>
            prevUser ? { ...prevUser, instance_status: connectionState} : prevUser,
          );
        }
      } catch (error) {
        console.error("Error checking connection state:", error);
      }
    }, 3000);

    // تنظيف الـ interval عند الخروج أو تغيير الـ dependencies
    return () => clearInterval(interval);
  }, [selectedUser, t]);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      is_active: e.target.checked,
    });
  };

  const handleUserUpdate = async (userId: number) => {
    setLoading(true);
    try {
      const updatedUser = await userAPI.updateUser(userId, {
        is_active: selectedUser?.is_active,
        username: selectedUser?.username,
        mobile: selectedUser?.mobile,
        role_id: selectedUser?.role_id,
      });
      if (updatedUser) {
        showToast(
          `${selectedUser?.username} ${t("users.updateSuccess")}`,
          "success",
        );
        setShowModal(false);
        // Refresh users list
        const response = await userAPI.getUsers(pharmacyId);
        setUsers(response);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {user?.role_id.toString() === "1" && (
        <div className="dark:bg-slate-800/90 p-4 rounded-lg border dark:border-slate-700 mb-6 dark:text-slate-100">
          <label className="text-sm font-semibold dark:text-slate-100 mb-2 flex items-center gap-2">
            <StoreIcon fontSize="small" />
            {t("users.selectPharmacy") || "Select Pharmacy"}
          </label>
          <select
            name="pharmacyId"
            value={pharmacyId}
            onChange={(e) => handlePharmacyClick(Number(e.target.value))}
            className="w-full md:w-1/3 px-3 py-2 dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value={0}>All Pharmacies</option>
            {pharmacies?.map((pharmacy) => (
              <option key={pharmacy.id} value={pharmacy.id}>
                {pharmacy.pharmacy_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: User) => (
          <div
            key={user.id.toString()}
            onClick={() => handleUserClick(user)}
            className={`group relative border p-5 rounded-xl hover:shadow-lg dark:hover:shadow-slate-700 transition-all duration-200 cursor-pointer overflow-hidden ${
              user.instance_status === "open"
                ? "dark:bg-slate-800 dark:border-slate-700"
                : "dark:bg-slate-900/50 dark:border-slate-800 grayscale-[0.5]"
            }`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-slate-700 rounded-full group-hover:bg-slate-600 transition-colors" />

            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-full dark:bg-slate-700 flex items-center justify-center dark:text-slate-100">
                {user?.avatar !== "/public/avatar.png" ? (
                  <img
                    src={user?.avatar}
                    className="rounded-full w-12 h-12 m-auto"
                  />
                ) : (
                  <PersonIcon
                    className="mx-auto text-slate-300 mb-2"
                    fontSize="large"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold dark:text-slate-100 truncate transition-colors">
                  {user.username}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <PhoneIcon sx={{ fontSize: 14 }} />
                  <span>{user.mobile}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                    user.is_active
                      ? "bg-emerald-900 text-emerald-200"
                      : "bg-rose-900 text-rose-200"
                  }`}
                >
                  <CircleIcon sx={{ fontSize: 8 }} />
                  {user.is_active
                    ? t("common.active") || "Active"
                    : t("common.inactive") || "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full py-12 text-center dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-700">
            <PersonIcon
              className="mx-auto text-slate-400 mb-2"
              fontSize="large"
            />
            <p className="dark:text-slate-300 font-medium">
              {t("users.noUsersFound") || "No users found"}
            </p>
          </div>
        )}
      </div>

      {showModal && selectedUser && (
        <Modal
          onClose={() => setShowModal(false)}
          isOpen={showModal}
          title={modalTitle}
        >
          <div className="space-y-5 py-4">
            <Input
              label={t("users.firstName")}
              value={selectedUser.username}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, username: e.target.value })
              }
              placeholder="Username"
            />

            <Input
              label={t("users.mobile")}
              value={selectedUser.mobile}
              minLength={11}
              maxLength={11}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, mobile: e.target.value })
              }
              placeholder="01xxxxxxxxx"
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${selectedUser.is_active ? "bg-green-100 text-green-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-rose-900/30 dark:text-rose-400"}`}
                >
                  <CircleIcon sx={{ fontSize: 16 }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {t("users.active")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {selectedUser.is_active
                      ? t("users.accountIsCurrentlyActive")
                      : t("users.accountIsSuspended")}
                  </p>
                </div>
              </div>
              <Switch
                checked={selectedUser?.is_active}
                onChange={handleToggleChange}
                color="primary"
              />
            </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {t("users.whatsapp.instance")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t("users.whatsapp.status")}:{" "}
                    <span
                      className={`font-bold ${selectedUser.instance_status === "open" ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {selectedUser.instance_status === "open" ? t("common.active") : (selectedUser.instance_status || t("users.whatsapp.disconnected"))}
                    </span>
                  </p>
                </div>
                {selectedUser.instance_status !== "open" && (
                  <Button
                    onClick={handleConnectWhatsApp}
                    isLoading={connecting}
                    disabled={connecting}
                  >
                    {t("users.whatsapp.connect")}
                  </Button>
                )}
                {selectedUser.instance_status === "open" && (
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                    <CircleIcon sx={{ fontSize: 10 }} /> {t("users.whatsapp.connected")}
                  </span>
                )}
              </div>

              <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center">
                {pairingCode ? (
                  <>
                    <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider">
                      {t("users.whatsapp.pairingCode")}
                    </p>
                    <p className="text-2xl font-mono font-bold text-black tracking-widest">
                      {pairingCode}
                    </p>
                    <p className="text-[10px] text-blue-400 mt-2">
                  {t("users.whatsapp.expiresIn")} {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </p>
                  </>
                ) : qrCode?(
                  <>
                    <img
                      src={qrCode || ""}
                      alt="QR Code"
                      className="mx-auto w-32 h-32"
                    />
                    <p className="text-xs text-blue-300 mt-2 uppercase tracking-wider">
                      {t("users.whatsapp.scanQR")}
                    </p>
                    <p className="text-[10px] text-blue-400 mt-2">
                  {t("users.whatsapp.expiresIn")} {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </p>
                  </>
                ):null}  
                
              </div>
              {timer === 0 &&
                !pairingCode &&
                selectedUser.instance_status === "PENDING" && (
                  <p className="text-xs text-rose-400 text-center">
                    {t("users.whatsapp.pairingExpired")}
                  </p>
                )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                fullWidth
                onClick={() => handleUserUpdate(selectedUser?.id)}
                isLoading={loading}
              >
                {t("common.update")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
