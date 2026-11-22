import { useEffect, useState } from 'react';
import Modal from '../Modal';
import type { CustomerItem, CustomerRequest } from '../../api/customersApi';

interface CustomerFormModalProps {
    open: boolean;
    initialData: CustomerItem | null;
    onClose: () => void;
    onSubmit: (payload: CustomerRequest) => Promise<void>;
}

export default function CustomerFormModal({
    open,
    initialData,
    onClose,
    onSubmit,
}: CustomerFormModalProps) {
    const isEdit = Boolean(initialData);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setError(null);
            if (initialData) {
                setName(initialData.name);
                setPhone(initialData.phone);
                setEmail(initialData.email ?? '');
                setAddress(initialData.address ?? '');
            } else {
                setName('');
                setPhone('');
                setEmail('');
                setAddress('');
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedPhone) {
            setError('Name and Phone are required.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                name: trimmedName,
                phone: trimmedPhone,
                email: email.trim() || undefined,
                address: address.trim() || undefined,
            });
            onClose();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to save customer.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} title={isEdit ? 'Edit Customer' : 'New Customer'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        {error}
                    </div>
                )}

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        maxLength={20}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <input
                        type="email"
                        maxLength={100}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Address</label>
                    <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Customer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}