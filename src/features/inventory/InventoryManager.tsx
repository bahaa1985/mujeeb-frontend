import React, { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { inventoryAPI, type InventoryItem, type InventoryUpdate } from '../../api/inventoryAPI';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

type StockFilter = 'all' | 'in' | 'out';
type InventoryDraft = Omit<InventoryUpdate, 'price' | 'units_count' | 'quantity'> & {
  price: string;
  units_count: string;
  quantity: 0 | 1;
};

const createDraft = (item: InventoryItem): InventoryDraft => ({
  en_name: item.en_name ?? '',
  ar_name: item.ar_name ?? '',
  active_material: item.active_material ?? '',
  dosage_form: item.dosage_form ?? '',
  drug_type: item.drug_type ?? '',
  price: item.price === null ? '' : String(item.price),
  units_count: item.units_count === null ? '' : String(item.units_count),
  quantity: item.quantity !== null && item.quantity > 0 ? 1 : 0,
});

export const InventoryManager: React.FC = () => {
  const { t, dir } = useLanguage();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState<StockFilter>('all');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [draft, setDraft] = useState<InventoryDraft | null>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    if(search.trim()!==''){
    inventoryAPI.getInventory({ page, limit: 20, search, stock })
      .then((result) => {
        if (!active) return;
        setItems(result.data);
        setLastPage(result.meta.lastPage);
        if (selectedItem && !result.data.some((item) => item.id === selectedItem.id)) {
          setSelectedItem(null);
          setDraft(null);
        }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message = isAxiosError(reason)
          ? reason.response?.data?.message ?? reason.message
          : reason instanceof Error ? reason.message : t('inventory.updateFailed');
        setError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }

    return () => { active = false; };
  }, [page, reload, search, selectedItem, stock, t]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateDraft = <K extends keyof InventoryDraft>(field: K, value: InventoryDraft[K]) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const updateTextField = (field: Exclude<keyof InventoryDraft, 'quantity'>, value: string) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const selectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDraft(createDraft(item));
    requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedItem || !draft) return;

    const price = draft.price.trim() === '' ? null : Number(draft.price);
    const unitsCount = draft.units_count.trim() === '' ? null : Number(draft.units_count);
    if ((price !== null && !Number.isFinite(price)) || (unitsCount !== null && !Number.isFinite(unitsCount))) {
      setError(t('inventory.invalidNumber'));
      return;
    }

    const data: InventoryUpdate = {
      en_name: draft.en_name?.trim() || null,
      ar_name: draft.ar_name?.trim() || null,
      active_material: draft.active_material?.trim() || null,
      dosage_form: draft.dosage_form?.trim() || null,
      drug_type: draft.drug_type?.trim() || null,
      price,
      units_count: unitsCount,
      quantity: draft.quantity,
    };

    setSaving(true);
    setError('');
    try {
      const result = await inventoryAPI.updateInventory(selectedItem.id, data);
      setSelectedItem(result.data);
      setDraft(createDraft(result.data));
      setReload((current) => current + 1);
      showToast(t('inventory.itemUpdated'), 'success');
    } catch (reason) {
      const message = isAxiosError(reason)
        ? reason.response?.data?.message ?? reason.message
        : reason instanceof Error ? reason.message : t('inventory.updateFailed');
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const stockFilters: { value: StockFilter; label: string }[] = [
    { value: 'all', label: t('inventory.allAvailability') },
    { value: 'in', label: t('inventory.available') },
    { value: 'out', label: t('inventory.notAvailable') },
  ];

  return (
    <section className="mt-8 w-full space-y-5 border-t border-gray-200 pt-6 dark:border-slate-700" dir={dir}>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{t('inventory.manageItems')}</h2>
        <p className="mt-1 text-gray-600 dark:text-slate-300">{t('inventory.manageItemsDescription')}</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('inventory.searchPlaceholder')}
          aria-label={t('inventory.searchPlaceholder')}
          className="min-h-11 flex-1 rounded border border-gray-300 bg-white px-3 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button type="submit" fullWidth={false}>{t('inventory.searchItems')}</Button>
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t('inventory.availability')}>
        {stockFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStock(filter.value);
              setPage(1);
            }}
            aria-pressed={stock === filter.value}
            className={`rounded border px-4 py-2 font-medium ${
              stock === filter.value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error ? <p role="alert" className="rounded bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p> : null}
      {loading ? <p className="text-gray-600 dark:text-slate-300">{t('inventory.loadingItems')}</p> : items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-4 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">{item.ar_name || item.en_name || '—'}</h3>
                {item.en_name && item.ar_name ? <p className="text-sm text-gray-600 dark:text-slate-300">{item.en_name}</p> : null}
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  {item.quantity !== null && item.quantity > 0 ? t('inventory.available') : t('inventory.notAvailable')}
                  {' · '}{t('inventory.price')}: {item.price ?? '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => selectItem(item)}
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                {t('inventory.editItem')}
              </button>
            </article>
          ))}
          {lastPage > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border px-3 py-2 disabled:opacity-50">
                {t('inventory.previous')}
              </button>
              <span>{page} / {lastPage}</span>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} className="rounded border px-3 py-2 disabled:opacity-50">
                {t('inventory.next')}
              </button>
            </div>
          ) : null}
        </div>
      ) : !loading ? <p className="text-gray-600 dark:text-slate-300">{t('inventory.noItems')}</p> : null}

      {selectedItem && draft ? (
        <form ref={editFormRef} onSubmit={saveItem} className="space-y-4 rounded-lg border border-gray-200 p-5 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t('inventory.editingItem')}: {selectedItem.ar_name || selectedItem.en_name || selectedItem.id}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['en_name', 'englishName', 'text'],
              ['ar_name', 'arabicName', 'text'],
              ['active_material', 'activeMaterial', 'text'],
              ['dosage_form', 'dosageForm', 'text'],
              ['drug_type', 'drugType', 'text'],
              ['price', 'price', 'number'],
              ['units_count', 'unitsCount', 'number'],
            ] as const).map(([field, label, type]) => (
              <label key={field} className="space-y-1 text-sm font-medium text-gray-800 dark:text-slate-200">
                <span>{t(`inventory.${label}`)}</span>
                <input
                  type={type}
                  step={type === 'number' ? 'any' : undefined}
                  value={draft[field] ?? ''}
                  onChange={(event) => updateTextField(field, event.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            ))}
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800 dark:text-slate-200">{t('inventory.availability')}</legend>
            <div className="flex gap-4">
              {([{ value: 1, label: 'available' }, { value: 0, label: 'notAvailable' }] as const).map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-gray-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name={`availability-${selectedItem.id}`}
                    checked={draft.quantity === option.value}
                    onChange={() => updateDraft('quantity', option.value)}
                  />
                  {t(`inventory.${option.label}`)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" isLoading={saving}>{t('inventory.saveItem')}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSelectedItem(null);
                setDraft(null);
              }}
            >
              {t('inventory.cancelEdit')}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
};
