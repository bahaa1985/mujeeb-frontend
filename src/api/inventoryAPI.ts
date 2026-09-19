import api from './axios';
import * as XLSX from 'xlsx';

export interface InventoryUploadResponse {
  success: boolean;
  message: string;
  importedCount?: number;
}

export interface DrugCardEntry {
  a_name?: string;
  e_name?: string;
  dosage_form: string;
  normalizedDosageForm:string
  active?: string
}

export const inventoryAPI = {
  /**
   * Upload inventory file (CSV or Excel)
   */
  // uploadInventory: async (file: File): Promise<InventoryUploadResponse> => {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const response = await api.post<InventoryUploadResponse>(
  //     '/inventory/upload',
  //     formData
  //   );
  //   return response.data;
  // },

  /**
   * Upload processed inventory rows (JSON) prepared by frontend
   */
  uploadProcessed: async (
    rows: Array<Record<string, unknown>>,
    pharmacy_id: number
  ): Promise<InventoryUploadResponse> => {
    const response = await api.post<InventoryUploadResponse>('/inventory/upload', {
      rows,
      pharmacy_id,
    });
    return response.data;
  },

  /**
   * Get DrugCard data from local file
   */
  getDrugCardData: async (): Promise<DrugCardEntry[]> => {
    // Load DrugCard.xlsx from public/ so frontend handles fuzzy matching locally
    const res = await fetch('/DrugCard.xlsx');
    if (!res.ok) throw new Error('Failed to fetch DrugCard.xlsx');
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as DrugCardEntry[];
    return data;
  },

  /**
   * Get inventory list with pagination and filtering
   */
  getInventory: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  /**
   * Get Inventory for a pharmacy
   */
  getInventoryCountByPharmacyId:async(pharmacyId:number)=>{
   if(pharmacyId){const response = await api.get(`/inventory/pharmacy/${pharmacyId}`);
   return response.data
  }
  },
  /**
   * Delete inventory item
   */
  deleteInventory: async (id: string) => {
    await api.delete(`/inventory/${id}`);
  },
};
