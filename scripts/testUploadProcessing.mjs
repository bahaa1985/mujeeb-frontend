import fs from 'fs';
import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import Fuse from 'fuse.js';

const basename = 'ghalid_file - Copy.xlsx';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = path.join(__dirname, '..', 'src', basename);
const drugCardPath = path.join(__dirname, '..', 'src', 'DrugCard.xlsx');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

const moveQuantityToEnd = (text) => {
  const quantities = [];
  const cleaned = text.replace(/(\d+(?:[.,]\d+)?)(?:\s*)(مللي|مللى|جم|جرام)/g, (_, num, unit) => {
    quantities.push(`${num}${unit}`);
    return '';
  });
  const normalized = cleaned.replace(/\s+/g, ' ').trim();
  return quantities.length > 0 ? `${normalized} ${quantities.join(' ')}`.trim() : normalized;
};

const getFirstSector = (text) => text.split(/\s+|[-,/()]+/)[0]?.trim() || text;

const normalizeArabicText = (text) => text
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

const normalizeDosageFormText = (text) => text
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
    if (firstSectorResults.length === 1) return firstSectorResults[0].item;

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
    if (matchedDrug) return { matchedDrug, matchedDosageForm: matchedDrug.dosage_form || form };
  }

  const matchedDrug = tryFirstSectorSearch(null);
  if (matchedDrug) return { matchedDrug, matchedDosageForm: matchedDrug.dosage_form };
  return {};
};

const normalizeDrugCardData = (drugCardData) => {
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

    return {
      ...drug,
      a_name: normalizedAName,
      e_name: normalizedEName,
      normalizedAName,
      normalizedAFirstSector,
      normalizedEName,
      normalizedEFirstSector,
      normalizedDosageForm,
      firstChar
    };
  });
};

const groupDrugCardByFirstChar = (normalizedDrugCardData) => {
  return normalizedDrugCardData.reduce((group, drug) => {
    const char = drug.firstChar || '';
    if (!group[char]) group[char] = [];
    group[char].push(drug);
    return group;
  }, {});
};

const processRow = (row, a_nameIndex, e_nameIndex, dosageFormIndex, unitsIndex, drugCardByFirstChar) => {
  if (!row || row.length === 0) return row;
  const searchName = e_nameIndex !== -1 && row[e_nameIndex]
    ? row[e_nameIndex]?.toString().trim()
    : row[a_nameIndex]?.toString().trim();
  if (!searchName) {
    row[dosageFormIndex] = null;
    row[unitsIndex] = null;
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
    row[dosageFormIndex] = selectedDosageForm;
    row[unitsIndex] = selectedUnitOne ? 1 : matchedDrug.units ?? null;
  } else {
    row[dosageFormIndex] = null;
    row[unitsIndex] = null;
  }

  return row;
};

const readXlsxAsRows = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
};

const run = async () => {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Test file not found: ${workbookPath}`);
  }
  if (!fs.existsSync(drugCardPath)) {
    throw new Error(`DrugCard file not found: ${drugCardPath}`);
  }

  const data = readXlsxAsRows(workbookPath);
  const drugCardRaw = readXlsxAsRows(drugCardPath);

  const headers = data[0].map((h) => (h === null || h === undefined ? '' : h.toString().toLowerCase().trim()));
  const dataRows = data.slice(1).map(row => [...row]);

  const requiredColumns = ['a_name', 'price', 'unit'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const a_nameIndex = headers.indexOf('a_name');
  const e_nameIndex = headers.indexOf('e_name');
  const dosageFormIndex = headers.length;
  const unitsIndex = headers.length + 1;

  const drugCardHeaders = drugCardRaw[0].map((h) => (h === null || h === undefined ? '' : h.toString().toLowerCase().trim()));
  const drugCardRows = drugCardRaw.slice(1).map(row => {
    const getCell = (index) => {
      const value = row[index];
      return value == null ? '' : String(value).trim();
    };

    return {
      a_name: getCell(drugCardHeaders.indexOf('a_name')),
      e_name: getCell(drugCardHeaders.indexOf('e_name')),
      dosage_form: getCell(drugCardHeaders.indexOf('dosage_form')),
      units: (() => {
        const idx = drugCardHeaders.indexOf('units');
        const value = row[idx];
        return value == null ? undefined : Number(value);
      })()
    };
  });

  const normalizedDrugCard = normalizeDrugCardData(drugCardRows);
  const drugCardByFirstChar = groupDrugCardByFirstChar(normalizedDrugCard);

  console.log('Test file:', basename);
  console.log('Total data rows:', dataRows.length);
  console.log('CPU cores:', os.cpus().length);

  const sequentialRows = dataRows.map(row => [...row]);
  const startSeq = performance.now();
  sequentialRows.forEach(row => processRow(row, a_nameIndex, e_nameIndex, dosageFormIndex, unitsIndex, drugCardByFirstChar));
  const seqTime = performance.now() - startSeq;

  const startWorker = performance.now();
  const workerResult = await processWithWorkerThreads(
    dataRows.map(row => [...row]),
    a_nameIndex,
    e_nameIndex,
    dosageFormIndex,
    unitsIndex,
    drugCardByFirstChar
  );
  const workerTime = performance.now() - startWorker;

  console.log(`Sequential processing time: ${seqTime.toFixed(2)} ms`);
  console.log(`Worker-thread processing time: ${workerTime.toFixed(2)} ms`);
  console.log(`Rows processed worker: ${workerResult.length}`);
};

const processWithWorkerThreads = async (rows, a_nameIndex, e_nameIndex, dosageFormIndex, unitsIndex, drugCardByFirstChar) => {
  const cpuCount = Math.max(os.cpus().length, 1);
  const workerCount = Math.min(cpuCount, rows.length);
  const chunkSize = Math.ceil(rows.length / workerCount);
  const workerPath = path.resolve(__dirname, 'nodeUploadProcessorWorker.mjs');

  // Create persistent worker pool and preload drugCard index once per worker
  const workers = [];
  const initPromises = [];
  const spawnStart = performance.now();
  for (let idx = 0; idx < workerCount; idx += 1) {
    const worker = new Worker(workerPath, { argv: [], execArgv: [], stdin: false });
    workers.push(worker);

    initPromises.push(new Promise((resolve, reject) => {
      const onMessage = (msg) => {
        if (msg && msg.type === 'init_ack') {
          worker.off('message', onMessage);
          resolve();
        }
      };
      worker.once('message', onMessage);
      worker.once('error', reject);
      worker.postMessage({ type: 'init', drugCardByFirstChar });
    }));
  }
  const spawnEnd = performance.now();
  await Promise.all(initPromises);

  // Now send chunks to workers round-robin
  const processPromises = [];
  for (let idx = 0; idx < workerCount; idx += 1) {
    const start = idx * chunkSize;
    if (start >= rows.length) break;
    const chunk = rows.slice(start, Math.min(start + chunkSize, rows.length));
    const worker = workers[idx];

    processPromises.push(new Promise((resolve, reject) => {
      const onMessage = (msg) => {
        if (msg && msg.type === 'result' && typeof msg.chunkIndex !== 'undefined') {
          worker.off('message', onMessage);
          resolve(msg);
        }
      };
      worker.once('message', onMessage);
      worker.once('error', reject);
      worker.postMessage({ type: 'process', chunkIndex: idx, rows: chunk, a_nameIndex, e_nameIndex, dosageFormIndex, unitsIndex });
    }));
  }

  const results = await Promise.all(processPromises);

  // Clean up workers
  await Promise.all(workers.map(w => new Promise((res) => { w.terminate().then(() => res()).catch(() => res()); })));

  return results.sort((a, b) => a.chunkIndex - b.chunkIndex).flatMap(r => r.rows);
};

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
