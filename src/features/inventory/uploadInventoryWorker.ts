import type { DrugCardEntry } from './uploadInventoryHandler';
import {
  extractDosageForms,
  findBestDrugCardMatch,
  getFirstSector,
  isUnitOneDosageForm,
  moveQuantityToEnd,
  normalizeArabicText
} from './uploadInventoryHandler';

type ExcelRow = (string | number | boolean | null)[];

type WorkerRequest = {
  chunkIndex: number;
  rows: ExcelRow[];
  a_nameIndex: number;
  e_nameIndex: number;
  dosageFormIndex: number;
  unitsIndex: number;
  activeIndex?: number;
  drugCardByFirstChar: Record<string, DrugCardEntry[]>;
};

type WorkerResponse = {
  chunkIndex: number;
  rows: ExcelRow[];
};

const processChunk = (request: WorkerRequest): WorkerResponse => {
  const processedRows = request.rows.map(row => {
    if (!row || row.length === 0) {
      return row;
    }

    const searchName = request.e_nameIndex !== -1 && row[request.e_nameIndex]
      ? row[request.e_nameIndex]?.toString().trim()
      : row[request.a_nameIndex]?.toString().trim();

    if (!searchName) {
      row[request.dosageFormIndex] = null;
      row[request.unitsIndex] = null;
      return row;
    }

    const rawSearchName = moveQuantityToEnd(searchName);
    const normalizedSearchName = normalizeArabicText(rawSearchName);
    const rawFirstSector = getFirstSector(rawSearchName);
    const normalizedFirstSector = normalizeArabicText(rawFirstSector);
    const searchDosageForms = extractDosageForms(rawSearchName);
    const firstChar = normalizedFirstSector.charAt(0);
    const filteredDrugCardData = request.drugCardByFirstChar[firstChar] || [];

    const { matchedDrug, matchedDosageForm } = findBestDrugCardMatch(
      filteredDrugCardData,
      normalizedFirstSector,
      normalizedSearchName,
      searchDosageForms
    );

    if (matchedDrug) {
      const selectedDosageForm = matchedDosageForm || matchedDrug.dosage_form || null;
      const selectedUnitOne = selectedDosageForm ? isUnitOneDosageForm(selectedDosageForm) : false;

      row[request.dosageFormIndex] = selectedDosageForm;
      row[request.unitsIndex] = selectedUnitOne ? 1 : matchedDrug.units ?? null;
      if (typeof request.activeIndex === 'number') {
        row[request.activeIndex] = matchedDrug.active ?? null;
      }
    } else {
      row[request.dosageFormIndex] = null;
      row[request.unitsIndex] = null;
      if (typeof request.activeIndex === 'number') {
        row[request.activeIndex] = null;
      }
    }

    return row;
  });

  return {
    chunkIndex: request.chunkIndex,
    rows: processedRows
  };
};

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const result = processChunk(event.data);
  self.postMessage(result);
});
