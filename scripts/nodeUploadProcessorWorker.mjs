import { parentPort } from 'worker_threads';
import Fuse from 'fuse.js';

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
};

const moveQuantityToEnd = (text) => {
  const quantities = [];
  const cleaned = text.replace(/(\d+(?:[.,]\d+)?)(?:\s*)(مللي|مللى|جم|جرام)/g, (_, num, unit) => {
    quantities.push(`${num}${unit}`);
    return '';
  });
  const normalized = cleaned.replace(/\s+/g, ' ').trim();
  return quantities.length > 0 ? `${normalized} ${quantities.join(' ')}`.trim() : normalized;
};

const getFirstSector = (text) => {
  return text.split(/\s+|[-,/()]+/)[0]?.trim() || text;
};

const normalizeArabicText = (text) => {
  return text
    .replace(/أ/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/مللي|مللى/g, 'مل')
    .replace(/جرام/g, 'جم')
    .replace(/مل جرام|ملجرام/g, 'مجم')
    .replace(/معلق/g, 'شراب')
    .replace(/(?:كبسولات|كبسولة|كبسوله)/g, 'كبسول')
    .replace(/(?:أقراص|اقراص)/g, 'قرص')
    .replace(/أكياس|اكياس/g, 'كيس')
    .replace(/(?:قطرة|قطره)/g, 'نقط')
    .replace(/امبولات|أمبولات/g, 'امبول')
    .replace(/[-/]/g, '')
    .trim();
};

const normalizeDosageFormText = (text) => {
  return text
    .toLowerCase()
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/(?:كبسولات|كبسولة|كبسوله)/g, 'كبسول')
    .replace(/(?:أقراص|اقراص)/g, 'قرص')
    .replace(/أكياس|اكياس/g, 'كيس')
    .replace(/(?:قطرة|قطره)/g, 'نقط')
    .replace(/امبولات|أمبولات/g, 'امبول')
    .replace(/زجاجه/g, 'زجاجة')
    .replace(/قطره/g, 'قطرة')
    .replace(/نقطه/g, 'نقطة')
    .replace(/سرنجه/g, 'سرنجة')
    .replace(/لاصقه/g, 'لاصقة')
    .replace(/\s+/g, ' ')
    .trim();
};

const dosageForms = [
  'أمبول', 'زجاجة', 'كبسول', 'بلسم', 'كريم', 'قطرة أذن', 'فوار', 'قطرة عين',
  'مرهم عين', 'غسول وجه', 'شريط', 'رغوة', 'جل', 'زيت شعر', 'لوشن',
  'أقراص استحلاب', 'قطرة فم', 'غسول فم', 'قطرة أنف', 'زيت', 'مرهم', 'قطرة فموي',
  'دهان', 'لاصقة', 'قلم حقن', 'قطعة', 'بودرة', 'كيس', 'سيرم', 'شامبو',
  'صابون', 'محلول', 'بخاخ', 'لبوس', 'معلق', 'سرنجة', 'شراب', 'قرص',
  'أقراص', 'غسول مهبلي', 'فيال'
];

const isUnitOneDosageForm = (form) => {
  if (!form) return false;
  const normalizedForm = normalizeDosageFormText(form);
  const unitOneFormRoots = [
    'قطرة', 'غسول', 'مرهم', 'زيت', 'زجاجة', 'شراب', 'كريم', 'معلق',
    'شامبو', 'دهان', 'لوشن', 'سيرم', 'صابون', 'سبراي'
  ];
  return unitOneFormRoots.some(root => normalizedForm.startsWith(root));
};

const extractDosageForm = (text) => {
  if (!text) return '';
  const normalizedText = normalizeDosageFormText(text);
  for (const form of dosageForms) {
    const normalizedForm = normalizeDosageFormText(form);
    const regex = new RegExp(`(^|\\s|[-,/()])${escapeRegExp(normalizedForm)}($|\\s|[-,/()])`, 'i');
    if (regex.test(normalizedText)) return form;
  }
  return '';
};

const extractDosageForms = (text) => {
  if (!text) return [];
  const normalizedText = normalizeDosageFormText(text);
  const foundForms = [];
  const sortedForms = [...dosageForms].sort((a, b) => normalizeDosageFormText(b).length - normalizeDosageFormText(a).length);
  for (const form of sortedForms) {
    const normalizedForm = normalizeDosageFormText(form);
    const regex = new RegExp(`(^|\\s|[-,/()])${escapeRegExp(normalizedForm)}($|\\s|[-,/()])`, 'i');
    if (regex.test(normalizedText) && !foundForms.includes(form)) {
      foundForms.push(form);
    }
  }
  return foundForms;
};

const findBestDrugCardMatch = (
  filteredDrugCardData,
  normalizedFirstSector,
  normalizedSearchName,
  searchDosageForms
) => {
  const tryFirstSectorSearch = (form) => {
    const candidates = form
      ? filteredDrugCardData.filter(drug => drug.normalizedDosageForm === form)
      : filteredDrugCardData;

    const sectorFuse = new Fuse(candidates, {
      keys: ['normalizedAFirstSector'],
      threshold: 0.2,
      includeScore: true
    });

    const firstSectorResults = sectorFuse.search(normalizedFirstSector);
    if (firstSectorResults.length === 1) {
      return firstSectorResults[0].item;
    }

    if (firstSectorResults.length > 1) {
      const candidateItems = firstSectorResults.map(result => result.item);
      const fullFuse = new Fuse(candidateItems, {
        keys: ['normalizedAName', 'normalizedEName'],
        threshold: 0.3,
        includeScore: true
      });
      const fullResults = fullFuse.search(normalizedSearchName);
      return fullResults.length > 0 ? fullResults[0].item : firstSectorResults[0].item;
    }

    return undefined;
  };

  for (const form of searchDosageForms) {
    const matchedDrug = tryFirstSectorSearch(form);
    if (matchedDrug) {
      return { matchedDrug, matchedDosageForm: matchedDrug.dosage_form || form };
    }
  }

  const matchedDrug = tryFirstSectorSearch(null);
  if (matchedDrug) {
    return { matchedDrug, matchedDosageForm: matchedDrug.dosage_form };
  }

  return {};
};

let drugCardByFirstChar = {};

parentPort?.on('message', (request) => {
  // initialisation message with preloaded drugcard index
  if (request && request.type === 'init') {
    drugCardByFirstChar = request.drugCardByFirstChar || {};
    parentPort.postMessage({ type: 'init_ack' });
    return;
  }

  // process message for a chunk
  if (request && request.type === 'process') {
    const rows = request.rows.map(row => {
      if (!row || row.length === 0) return row;

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
      const filteredDrugCardData = drugCardByFirstChar[firstChar] || [];

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
      } else {
        row[request.dosageFormIndex] = null;
        row[request.unitsIndex] = null;
      }

      return row;
    });

    parentPort?.postMessage({ type: 'result', chunkIndex: request.chunkIndex, rows });
  }
});
