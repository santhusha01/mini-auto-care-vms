import { useState } from 'react';
import Modal from '../Modal';
import type { InventoryItem, InventoryRequest } from '../../api/inventoryApi';

interface InventoryFormModalProps {
  open: boolean;
  initialData: InventoryItem | null; // null = Create, item = Edit
  onClose: () => void;
  onSubmit: (payload: InventoryRequest) => Promise<void>;
}

export default function InventoryFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: InventoryFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name ?? '');
  const [unitPrice, setUnitPrice] = useState(
    initialData ? String(initialData.unitPrice) : ''
  );
  const [quantity, setQuantity] = useState(
    initialData ? String(initialData.quantity) : '0'
  );
  const [reorderLevel, setReorderLevel] = useState(
    initialData ? String(initialData.reorderLevel) : '5'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const price = Number(unitPrice);
    const qty = Number(quantity);
    const level = Number(reorderLevel);

    if (!trimmedName) {
      setError('Item name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Item name must be 100 characters or fewer.');
      return;
    }
    if (unitPrice === '' || Number.isNaN(price) || price < 0) {
      setError('Unit price must be 0 or greater.');
      return;
    }
    if (!Number.isInteger(qty) || qty < 0) {
      setError('Quantity must be a whole number, 0 or greater.');
      return;
    }
    if (!Number.isInteger(level) || level < 0) {
      setError('Reorder level must be a whole number, 0 or greater.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        unitPrice: price,
        quantity: qty,
        reorderLevel: level,
      });
      handleClose();
    } catch (err: unknown) {
      const data = (
        err as {
          response?: { data?: { message?: string; errors?: Record<string, string> } };
        }
      )?.response?.data;
      const fieldErrors = data?.errors ? Object.values(data.errors).join(' ') : '';
      setError(fieldErrors || data?.message || 'Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit Item' : 'New Item'} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {isEdit && (
          <p className="text-xs text-slate-500">
            Code: <span className="font-mono font-semibold">{initialData?.code}</span>
          </p>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Engine Oil 5W-30"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Unit Price (Rs.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Quantity</label>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isEdit}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            />
            {isEdit && (
              <p className="mt-1 text-[11px] text-slate-400">
                Quantity is read-only on edit. Use Adjust to change stock.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
