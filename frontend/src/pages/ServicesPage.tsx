import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import ServiceFormModal from '../components/services/ServiceFormModal';
import { useAuth } from '../auth/AuthContext';
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
  type ServiceItem,
  type ServiceRequest,
} from '../api/servicesApi';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function ServicesPage() {
  const { isAdmin } = useAuth();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & Confirm dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const activeParam =
        statusFilter === 'ALL' ? null : statusFilter === 'ACTIVE' ? true : false;

      const data = await fetchServices({
        search: debouncedSearch,
        active: activeParam,
        page,
        size: 10,
      });

      setServices(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load services.';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleSaveService = async (payload: ServiceRequest) => {
    if (editingService) {
      await updateService(editingService.id, payload);
      setToast({ message: 'Service updated successfully.', type: 'success' });
    } else {
      await createService(payload);
      setToast({ message: 'Service created successfully.', type: 'success' });
    }
    await loadServices();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setToast({ message: `Deleted "${deleteTarget.name}".`, type: 'success' });
      setDeleteTarget(null);
      await loadServices();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to delete service.';
      setToast({ message, type: 'error' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatLkr = (amount: number) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);

  const columns: Column<ServiceItem>[] = [
    {
      header: 'Service Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          {row.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Price',
      render: (row) => (
        <span className="font-mono font-medium text-slate-800">{formatLkr(row.price)}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) =>
        row.active ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Inactive
          </span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit service"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete service (Admin)"
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services Catalogue"
        subtitle="Manage workshop services, pricing, and availability for job cards."
        action={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Service
          </button>
        }
      />

      {/* Search & Status Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by service name or description..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setPage(0);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === filter
                  ? 'bg-[#0F2A43] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter === 'ACTIVE' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading services...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={services}
          keyExtractor={(row) => row.id}
          emptyMessage="No services found matching your filters."
        />
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong className="text-slate-700">{page + 1}</strong> of{' '}
            <strong className="text-slate-700">{totalPages}</strong> ({totalElements} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ServiceFormModal
        open={formOpen}
        initialData={editingService}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveService}
      />

      {/* Admin Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Services used in existing job cards cannot be deleted (deactivate instead).`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Notification */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}