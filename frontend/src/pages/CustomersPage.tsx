import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import CustomerFormModal from '../components/customers/CustomerFormModal';
import {
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    type CustomerItem,
    type CustomerRequest,
} from '../api/customersApi';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CustomerItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCustomers(debouncedSearch);
            setCustomers(data);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to load customers.';
            setToast({ message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const handleOpenCreate = () => {
        setEditingCustomer(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (customer: CustomerItem) => {
        setEditingCustomer(customer);
        setFormOpen(true);
    };

    const handleSaveCustomer = async (payload: CustomerRequest) => {
        if (editingCustomer) {
            await updateCustomer(editingCustomer.id, payload);
            setToast({ message: 'Customer updated successfully.', type: 'success' });
        } else {
            await createCustomer(payload);
            setToast({ message: 'Customer created successfully.', type: 'success' });
        }
        await loadCustomers();
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteCustomer(deleteTarget.id);
            setToast({ message: `Deleted "${deleteTarget.name}".`, type: 'success' });
            setDeleteTarget(null);
            await loadCustomers();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Unable to delete customer.';
            setToast({ message, type: 'error' });
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns: Column<CustomerItem>[] = [
        {
            header: 'Name',
            render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
        },
        {
            header: 'Phone',
            render: (row) => <span className="text-slate-700">{row.phone}</span>,
        },
        {
            header: 'Email',
            render: (row) => <span className="text-slate-600">{row.email || '—'}</span>,
        },
        {
            header: 'Address',
            render: (row) => (
                <span className="line-clamp-1 text-xs text-slate-500">{row.address || '—'}</span>
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-1.5">
                    <button
                        onClick={() => handleOpenEdit(row)}
                        title="Edit customer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => setDeleteTarget(row)}
                        title="Delete customer"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Customers"
                subtitle="Manage your client directory and contact information."
                action={
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        New Customer
                    </button>
                }
            />

            {/* Search Bar */}
            <div className="mb-4 relative w-full max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Loading customers...
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={customers}
                    keyExtractor={(row) => row.id}
                    emptyMessage="No customers found."
                />
            )}

            {/* Modals */}
            <CustomerFormModal
                open={formOpen}
                initialData={editingCustomer}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSaveCustomer}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete Customer"
                message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Toast
                message={toast?.message ?? null}
                type={toast?.type}
                onClose={() => setToast(null)}
            />
        </div>
    );
}