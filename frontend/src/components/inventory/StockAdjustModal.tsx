import { useEffect, useState } from 'react';
import Modal from '../Modal';
import type { InventoryItem, StockAdjustRequest } from '../../api/inventoryApi';

export type StockMode = 'IN' | 'OUT';

interface StockAdjustModalProps {
  open: boolean;
  item: InventoryItem | null;
  mode: StockMode;
  onClose: () => void;
  onSubmit: (id: number, payload: StockAdjustRequest) => Promise<void>;
}

export default function StockAdjustModal({
  open,
  item,
  mode,
  onClose,
  onSubmit,
}: StockAdjustModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount('');
      setReason('');
      setError(null);
    }
  }, [open, item, mode]);

  if (!item) return null;

  const numericAmount = Number(amount);
  const isValidAmount = Number.isInteger(numericAmount) && numericAmount > 0;
  const delta = mode === 'IN' ? numericAmount : -numericAmount;
  const projectedStock = isValidAmount ? item.quantity + delta : item.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidAmount) {
      setError('Quantity must be a whole number greater than 0.');
      return;
    }
    if (mode === 'OUT' && numericAmount > item.quantity) {
      setError(`Cannot remove ${numericAmount} units; only ${item.quantity} in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(item.id, {
        delta,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update stock.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === 'IN' ? `Stock In — ${item.code}` : `Stock Out / Adjust — ${item.code}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
            <span>
              Current Stock: <strong className="font-mono text-slate-900">{item.quantity}</strong>
            </span>
            <span>
              After Update:{' '}
              <strong
                className={`font-mono ${
                  projectedStock < 0
                    ? 'text-red-600'
                    : projectedStock <= item.reorderLevel
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                }`}
              >
                {projectedStock}
              </strong>
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {mode === 'IN' ? 'Quantity to Add' : 'Quantity to Deduct'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            max={mode === 'OUT' ? item.quantity : undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 10"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Reason / Reference Note
          </label>
          <input
            type="text"
            maxLength={150}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              mode === 'IN'
                ? 'e.g., Supplier restock GRN-104'
                : 'e.g., Damaged item / Manual stock correction'
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

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
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              mode === 'IN'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {submitting
              ? 'Updating...'
              : mode === 'IN'
                ? 'Confirm Stock In'
                : 'Confirm Stock Out'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
