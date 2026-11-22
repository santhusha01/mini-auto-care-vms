import { useEffect, useState } from 'react';
import Modal from '../Modal';
import type { InventoryItem, InventoryRequest } from '../../api/inventoryApi';

interface InventoryFormModalProps {
  open: boolean;
  initialData: InventoryItem | null;
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

  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (initialData) {
        setName(initialData.name);
        setUnitPrice(String(initialData.unitPrice));
        setQuantity(String(initialData.quantity));
        setReorderLevel(String(initialData.reorderLevel));
      } else {
        setName('');
        setUnitPrice('');
        setQuantity('0');
        setReorderLevel('5');
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const numericPrice = Number(unitPrice);
    const numericQty = Number(quantity);
    const numericReorder = Number(reorderLevel);

    if (!trimmedName) {
      setError('Item name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Item name must be 100 characters or fewer.');
      return;
    }
    if (unitPrice === '' || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError('Unit price must be 0 or greater.');
      return;
    }
    if (!isEdit && (!Number.isInteger(numericQty) || numericQty < 0)) {
      setError('Initial quantity must be a whole number 0 or greater.');
      return;
    }
    if (!Number.isInteger(numericReorder) || numericReorder < 0) {
      setError('Reorder level must be a whole number 0 or greater.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        unitPrice: numericPrice,
        quantity: isEdit ? initialData!.quantity : numericQty,
        reorderLevel: numericReorder,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save inventory item.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? `Edit Item — ${initialData?.code}` : 'New Inventory Item'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
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
            placeholder="e.g., Synthetic Engine Oil 5W-30 (4L)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Unit Price (LKR) <span className="text-red-500">*</span>
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Reorder Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
              required
            />
          </div>
        </div>

        {!isEdit ? (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Initial Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
              required
            />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Current stock is <strong className="font-mono text-slate-800">{initialData?.quantity}</strong>. Use{' '}
            <strong>Stock In</strong> or <strong>Stock Out</strong> actions to adjust stock levels.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
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
