import React, { useEffect, useState } from "react";
import { pharmacyAPI } from "../../api/pharmacyAPI";
import type { Pharmacy } from "../../types/pharmacy";
import { Modal, Switch } from "@mui/material";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../../components/ui/Button";

export const PharmaciesList: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>();
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { t,dir } = useLanguage();
  
  const fetchPharmacies = async () => {
    try {
      const pharmaciesData = await pharmacyAPI.getPharmacies();
      setPharmacies(pharmaciesData);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    }
  };
  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setModalTitle(pharmacy.pharmacy_name);
    setShowModal(true);
  };
  const handlePharmacyUpdate = async (pharmacyId: number) => {
    setLoading(true);
    try {
      const updatedPharmacy = await pharmacyAPI.updatePharmacy(pharmacyId, {
        pharmacy_name: selectedPharmacy?.pharmacy_name || "",
        pharmacy_address: selectedPharmacy?.pharmacy_address || "",
        work_time:selectedPharmacy?.work_time||"",
        delivery:selectedPharmacy?.delivery,
        delivery_price: selectedPharmacy?.delivery_price ?? 0,
        logo:selectedPharmacy?.logo
      });
      if (updatedPharmacy) {
        showToast(t('pharmacy.updateSuccess'), "success");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating pharmacy:", error);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className={`dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden`}>
      <div className="p-6 border-b dark:border-slate-700">
        <h2 className="text-xl font-bold dark:text-slate-100">{t('pharmacy.listHeading')}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-left border-collapse`} dir={dir}>
          <thead>
            <tr className={`${dir === 'rtl' ? 'text-right': 'text-left'} dark:bg-slate-800 border-b dark:border-slate-700`}>
              <th className={`${dir==="rtl"? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wider`}>{t('pharmacy.name')}</th>
              <th className={`${dir==="rtl"? 'text-right' : "text-left"} px-6 py-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wider`}>{t('pharmacy.address')}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider text-right"></th>
            </tr>
          </thead>
          <tbody className={`divide-y dark:divide-slate-700`}>
            {pharmacies?.map((pharmacy: Pharmacy) => {
              return (
                <tr
                  key={pharmacy.id}
                  className="dark:hover:bg-slate-800/70 transition-colors duration-200 group cursor-pointer"
                  onClick={() => handlePharmacyClick(pharmacy)}
                >
                  <td className="px-6 py-4">
                    <div className={`font-medium dark:text-slate-100 ${dir==="rtl"? 'text-right' : 'text-left'}`}>
                      {pharmacy.pharmacy_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`dark:text-slate-400 text-sm ${dir==="rtl"? 'text-right' : "text-left"}`}>{pharmacy.pharmacy_address}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="text-sm font-medium dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:hover:text-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePharmacyClick(pharmacy);
                      }}
                    >
                      {t('common.edit') || 'Edit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!pharmacies || pharmacies.length === 0) && (
          <div className="p-8 text-center dark:text-slate-300 dark:bg-slate-900 rounded-b-xl border-t border-slate-700">
            No pharmacies found.
          </div>
        )}
      </div>
      {showModal && selectedPharmacy && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          // aria-labelledby="modal-modal-title"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-gray-50 dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-700 focus:outline-none">
            <h2 id="modal-modal-title" className="text-2xl font-bold dark:text-slate-100 mb-6">{modalTitle}</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold dark:text-slate-200 mb-1">{t('pharmacy.name')}</label>
                <input className="w-full p-3 rounded-lg dark:bg-slate-800 bg-gray-50 dark:text-slate-100 border dark:border-slate-700" defaultValue={selectedPharmacy.pharmacy_name} onChange={(e)=>selectedPharmacy.pharmacy_name=e.target.value}></input>
              </div>
              <div>
                <label className="block text-sm font-semibold dark:text-slate-200 mb-1">{t('pharmacy.address')}</label>
                <input className="w-full p-3 rounded-lg dark:bg-slate-800 bg-gray-50 dark:text-slate-100 border dark:border-slate-700" defaultValue={selectedPharmacy.pharmacy_address} onChange={(e)=>selectedPharmacy.pharmacy_address=e.target.value}></input>
              </div>
              <div>
                <label className="block text-sm font-semibold dark:text-slate-200 mb-1">{t('pharmacy.workTime')}</label>
                <input className="w-full p-3 rounded-lg dark:bg-slate-800 bg-gray-50 dark:text-slate-100 border dark:border-slate-700" defaultValue={selectedPharmacy.work_time}onChange={(e)=>selectedPharmacy.work_time=e.target.value}></input>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="block text-sm font-semibold dark:text-slate-200 mb-1">{t('pharmacy.delivery')}</label>
                <Switch color="primary" defaultChecked={selectedPharmacy.delivery} onChange={(e)=>selectedPharmacy.delivery=e.target.checked}></Switch>
                <div className="min-w-[180px] flex-1">
                  <label className="block text-sm font-semibold dark:text-slate-200 mb-1">{t('pharmacy.deliveryPrice')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full p-3 rounded-lg dark:bg-slate-800 bg-gray-50 dark:text-slate-100 border dark:border-slate-700"
                    value={selectedPharmacy.delivery_price ?? 0}
                    onChange={(e) =>
                      setSelectedPharmacy({
                        ...selectedPharmacy,
                        delivery_price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex gap-3">              
              <Button
                disabled={loading}
                fullWidth
                onClick={() => handlePharmacyUpdate(selectedPharmacy.id)}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{t('users.updating') || 'Updating...'}</span>
                  </span>
                ) : (
                  t('common.update') || 'Update'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
