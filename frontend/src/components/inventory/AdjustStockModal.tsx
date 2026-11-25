import { useState } from 'react';
import Modal from '../Modal';
import type { InventoryItem } from '../../api/inventoryApi';

interface AdjustStockModalProps {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (delta: number, reason: string) => Promise<void>;
}

export default function AdjustStockModal({
  open,
  item,
  onClose,
  onSubmit,
}: AdjustStockModalProps) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericDelta = Number(delta);
  const validDelta = delta !== '' && Number.isInteger(numericDelta) && numericDelta !== 0;
  const newQuantity = item && validDelta ? item.quantity + numericDelta : null;
  const wouldGoNegative = newQuantity !== null && newQuantity < 0;

  const handleClose = () => {
    setDelta('');
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validDelta) {
      setError('Enter a whole number, for example 10 or -3.');
      return;
    }
    if (wouldGoNegative) {
      setError('Stock cannot go below 0.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(numericDelta, reason.trim());
      handleClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to adjust stock.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={`Adjust stock — ${item?.name ?? ''}`} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-600">
          Current quantity: <strong className="text-slate-900">{item?.quantity ?? 0}</strong>
        </p>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Adjustment <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="1"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="+10 or -3"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            autoFocus
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Use a negative number to remove stock
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">New quantity</label>
          <div
            className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
              wouldGoNegative
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-50 text-slate-800'
            }`}
          >
            {newQuantity !== null ? newQuantity : item?.quantity ?? 0}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Reason</label>
          <input
            type="text"
            maxLength={100}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Damaged, Restock"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
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
            disabled={submitting || !validDelta || wouldGoNegative}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
