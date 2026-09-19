import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { messagesAPI } from "../../api";
import { userAPI } from "../../api/userAPI";
import { inventoryAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { usePharmacy } from "../../context/PharamcyContext";
import { 
  PeopleOutline, 
  MessageOutlined, 
  VaccinesOutlined, 
  QueryStats, 
} from '@mui/icons-material';


interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-slate-100 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">{value}</p>
      </div>
      {icon && (
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export const DashboardStats: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pharmacy } = usePharmacy();
  console.log("pharmacy", pharmacy)
  const [messagesCount, setMessagesCount] = useState<string | number>(0);
  const [inventoryCount, setInventoryCount] = useState<string | number>(0);
  const [usersCount, setUsersCount] = useState<string | number>(0);
  const [ordersCount, setOrdersCount] = useState<string | number>(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await messagesAPI.getMessagesByPharmacy(Number(pharmacy?.id));
        if(messages){
          setMessagesCount(messages?.length)
        }
        else {
          setMessagesCount(0)
        }
      } catch {
        setMessagesCount("Not Available now");
      }
    };
const fetchInventory = async () => {
      try {
        const itemsCount = await inventoryAPI.getInventoryCountByPharmacyId(
          Number(pharmacy?.id),
        );
        if(itemsCount) setInventoryCount(itemsCount) 
        else {setInventoryCount(0)}
      } catch {
        setMessagesCount("Not Available now");
      }
    };

    const fetchUsers = async()=>{
      try {
        const users = await userAPI.getUsers(Number(pharmacy?.id))
        setUsersCount(users?.length)
      } catch {
        setUsersCount("Not Available Now")
      }
    }

    const fetchOrders = async () => {
      if (!user?.mobile) return;
      try {
        const count = await messagesAPI.getOrderMessageCountByUserMobile(user.mobile);
        setOrdersCount(count);
      } catch {
        setOrdersCount("Not Available now");
      }
    };

    fetchMessages();
    fetchInventory();
    fetchUsers();
    fetchOrders();
  }, [pharmacy?.id, user?.mobile]);

  const stats = [
    { label: t("dashboard.stats.messages"), value: messagesCount, icon: <MessageOutlined /> },
    { label: t("dashboard.stats.inventory"), value: inventoryCount, icon: <VaccinesOutlined /> },
    { label: t("dashboard.stats.users"), value: usersCount, icon: <PeopleOutline /> },
    { label: t("dashboard.stats.orders"), value: ordersCount, icon: <QueryStats /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};
