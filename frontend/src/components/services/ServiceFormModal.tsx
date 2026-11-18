import { useEffect, useState } from 'react';
import Modal from '../Modal';
import type { ServiceItem, ServiceRequest } from '../../api/servicesApi';

interface ServiceFormModalProps {
  open: boolean;
  initialData: ServiceItem | null; // null = Create mode, ServiceItem = Edit mode
  onClose: () => void;
  onSubmit: (payload: ServiceRequest) => Promise<void>;
}

export default function ServiceFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: ServiceFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description ?? '');
        setPrice(String(initialData.price));
        setActive(initialData.active);
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setActive(true);
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName) {
      setError('Service name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Service name must be 100 characters or fewer.');
      return;
    }
    if (price === '' || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError('Price must be 0 or greater.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim() || undefined,
        price: numericPrice,
        active,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save service.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit Service' : 'New Service'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Full Service & Oil Change"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details about this service..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/300</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Price (LKR) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-slate-800">Active Status</p>
            <p className="text-xs text-slate-500">
              Inactive services cannot be added to new job cards.
            </p>
          </div>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
}