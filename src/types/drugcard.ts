export interface DrugCardEntry {
  a_name?: string;
  e_name?: string;
  dosage_form: string;
  active_material?:string;
  normalizedDosageForm: string;
  normalizedAName?: string;
  normalizedAFirstSector?: string;
  normalizedEName?: string;
  normalizedEFirstSector?: string;
  firstChar?: string;
  units?: number;
}