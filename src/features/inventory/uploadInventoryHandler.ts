import Fuse from 'fuse.js';

export interface DrugCardEntry {
  a_name?: string;
  e_name?: string;
  dosage_form: string;
  active_material?: string;
  active?: string;
  active_ingredient?: string;
  normalizedDosageForm?: string;
  normalizedAName?: string;
  normalizedAFirstSector?: string;
  normalizedEName?: string;
  normalizedEFirstSector?: string;
  firstChar?: string;
  units?: number;
}

const dosageForms = [
  'أمبول', 'زجاجة', 'كبسول', 'بلسم', 'كريم', 'قطرة أذن', 'فوار', 'قطرة عين',
  'مرهم عين', 'غسول وجه', 'شريط', 'رغوة', 'جل', 'زيت شعر', 'لوشن',
  'أقراص استحلاب', 'قطرة فم', 'غسول فم', 'قطرة أنف', 'زيت', 'مرهم', 'قطرة فموي',
  'دهان', 'لاصقة', 'قلم حقن', 'قطعة', 'بودرة', 'كيس', 'سيرم', 'شامبو',
  'صابون', 'محلول', 'بخاخ', 'لبوس', 'معلق', 'سرنجة', 'شراب', 'قرص',
  'أقراص', 'غسول مهبلي', 'فيال'
];

const unitOneFormRoots = [
  'قطرة', 'غسول', 'مرهم', 'زيت', 'زجاجة', 'شراب', 'كريم', 'معلق',
  'شامبو', 'دهان', 'لوشن', 'سيرم', 'صابون', 'سبراي'
];

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const moveQuantityToEnd = (text: string): string => {
  const quantities: string[] = [];
  const cleaned = text.replace(/(\d+(?:[.,]\d+)?)(?:\s*)(مللي|مللى|جم|جرام)/g, (_, num, unit) => {
    quantities.push(`${num}${unit}`);
    return '';
  });
  const normalized = cleaned.replace(/\s+/g, ' ').trim();
  return quantities.length > 0 ? `${normalized} ${quantities.join(' ')}`.trim() : normalized;
};

export const getFirstSector = (text: string): string => {
  return text.split(/\s+|[-,/()]+/)[0]?.trim() || text;
};

export const normalizeDosageFormText = (text: string): string => {
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

export const isUnitOneDosageForm = (form: string): boolean => {
  if (!form) return false;
  const normalizedForm = normalizeDosageFormText(form);
  return unitOneFormRoots.some(root => normalizedForm.startsWith(root));
};

export const extractDosageForm = (text: string): string => {
  if (!text) return '';
  const normalizedText = normalizeDosageFormText(text);

  for (const form of dosageForms) {
    const normalizedForm = normalizeDosageFormText(form);
    const regex = new RegExp(`(^|\\s|[-,/()])${escapeRegExp(normalizedForm)}($|\\s|[-,/()])`, 'i');
    if (regex.test(normalizedText)) return form;
  }

  return '';
};

export const extractDosageForms = (text: string): string[] => {
  if (!text) return [];
  const normalizedText = normalizeDosageFormText(text);
  const foundForms: string[] = [];
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

export const normalizeArabicText = (text: string): string => {
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

export const normalizeDrugCardData = (drugCardData: DrugCardEntry[]): DrugCardEntry[] => {
  return drugCardData.map(drug => {
    const rawAName = drug.a_name ? moveQuantityToEnd(drug.a_name) : '';
    const rawEName = drug.e_name ? moveQuantityToEnd(drug.e_name) : '';

    const normalizedAName = rawAName ? normalizeArabicText(rawAName).trim() : '';
    const normalizedEName = rawEName ? normalizeArabicText(rawEName).trim() : '';
    const normalizedAFirstSector = normalizedAName ? normalizeArabicText(getFirstSector(normalizedAName)) : '';
    const normalizedEFirstSector = normalizedEName ? normalizeArabicText(getFirstSector(normalizedEName)) : '';
    const normalizedDosageForm = extractDosageForm(`${normalizedAName} ${normalizedEName}`.trim());

    const firstChar = normalizedAFirstSector.charAt(0)
      || normalizedEFirstSector.charAt(0)
      || normalizedAName.charAt(0)
      || normalizedEName.charAt(0)
      || '';

    const activeMaterial = drug.active_material ?? drug.active ?? drug['active_ingredient'] ?? undefined;
    return {
      ...drug,
      a_name: normalizedAName,
      e_name: normalizedEName,
      active: activeMaterial ?? undefined,
      active_material: activeMaterial ?? undefined,
      normalizedAName,
      normalizedAFirstSector,
      normalizedEName,
      normalizedEFirstSector,
      normalizedDosageForm,
      firstChar
    };
  });
};

export const groupDrugCardByFirstChar = (normalizedDrugCardData: DrugCardEntry[]): Record<string, DrugCardEntry[]> => {
  return normalizedDrugCardData.reduce((group, drug) => {
    const char = drug.firstChar || '';
    if (!group[char]) {
      group[char] = [];
    }
    group[char].push(drug);
    return group;
  }, {} as Record<string, DrugCardEntry[]>);
};

export const findBestDrugCardMatch = (
  filteredDrugCardData: DrugCardEntry[],
  normalizedFirstSector: string,
  normalizedSearchName: string,
  searchDosageForms: string[]
): { matchedDrug?: DrugCardEntry; matchedDosageForm?: string } => {
  const tryFirstSectorSearch = (form: string | null): DrugCardEntry | undefined => {
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
