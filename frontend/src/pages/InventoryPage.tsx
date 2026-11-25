import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import InventoryFormModal from '../components/inventory/InventoryFormModal';
import AdjustStockModal from '../components/inventory/AdjustStockModal';
import { useAuth } from '../auth/AuthContext';
import {
  adjustStock,
  createInventoryItem,
  deleteInventoryItem,
  fetchInventory,
  updateInventoryItem,
  type InventoryItem,
  type InventoryRequest,
} from '../api/inventoryApi';

export default function InventoryPage() {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCounts = useCallback(async () => {
    try {
      const [allRes, lowRes] = await Promise.all([
        fetchInventory({ page: 0, size: 1 }),
        fetchInventory({ lowStock: true, page: 0, size: 1 }),
      ]);
      setTotalItemsCount(allRes.totalElements);
      setLowStockCount(lowRes.totalElements);
    } catch {
      // Non-fatal if counts fail
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInventory({
        search: debouncedSearch,
        lowStock: lowStockOnly,
        page,
        size: 10,
      });
      setItems(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load inventory.';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, lowStockOnly, page]);

  useEffect(() => {
    loadItems();
    loadCounts();
  }, [loadItems, loadCounts]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSaveItem = async (payload: InventoryRequest) => {
    if (editingItem) {
      await updateInventoryItem(editingItem.id, payload);
      setToast({ message: 'Item updated successfully.', type: 'success' });
    } else {
      await createInventoryItem(payload);
      setToast({ message: 'Item created successfully.', type: 'success' });
    }
    await Promise.all([loadItems(), loadCounts()]);
  };

  const handleAdjust = async (delta: number, reason: string) => {
    if (!adjustTarget) return;
    const updated = await adjustStock(adjustTarget.id, delta, reason || undefined);
    setToast({
      message: `Stock updated. New quantity: ${updated.quantity}.`,
      type: 'success',
    });
    await Promise.all([loadItems(), loadCounts()]);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInventoryItem(deleteTarget.id);
      setToast({ message: `Deleted "${deleteTarget.name}".`, type: 'success' });
      setDeleteTarget(null);
      await Promise.all([loadItems(), loadCounts()]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to delete item.';
      setToast({ message, type: 'error' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const columns: Column<InventoryItem>[] = [
    {
      header: 'CODE',
      render: (row) => <span className="font-mono text-xs text-slate-600">{row.code}</span>,
    },
    {
      header: 'ITEM',
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      header: 'QTY',
      render: (row) => <span className="font-mono font-medium">{row.quantity}</span>,
    },
    {
      header: 'LEVEL',
      render: (row) =>
        row.lowStock ? (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            Low
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            OK
          </span>
        ),
    },
    {
      header: 'REORDER',
      render: (row) => <span className="font-mono text-slate-600">{row.reorderLevel}</span>,
    },
    {
      header: 'UNIT PRICE (RS.)',
      render: (row) => (
        <span className="font-mono font-medium text-slate-800">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      header: 'ACTIONS',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => setAdjustTarget(row)}
            title="Adjust stock"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Adjust
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit item"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete item (Admin)"
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
        title="Inventory"
        subtitle="Parts and stock quantities"
        action={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Item
          </button>
        }
      />

      {/* Summary Stat Cards */}
      <div className="mb-6 flex gap-4">
        <div className="min-w-28 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-2xl font-bold text-slate-900">{totalItemsCount}</div>
          <div className="text-xs font-medium text-slate-500">Items</div>
        </div>
        <div className="min-w-28 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-red-600">{lowStockCount}</span>
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          </div>
          <div className="text-xs font-medium text-slate-500">Low stock</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search code or name..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(0);
            }}
            className="h-4 w-4 rounded accent-blue-600"
          />
          Low stock only
        </label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading inventory...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          emptyMessage="No inventory items found."
        />
      )}

      {!loading && totalPages > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{items.length}</strong> of{' '}
            <strong className="text-slate-700">{totalElements}</strong>
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

      {formOpen && (
        <InventoryFormModal
          key={editingItem ? `edit-${editingItem.id}` : 'create'}
          open={formOpen}
          initialData={editingItem}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSaveItem}
        />
      )}

      {adjustTarget && (
        <AdjustStockModal
          key={`adjust-${adjustTarget.id}`}
          open={Boolean(adjustTarget)}
          item={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSubmit={handleAdjust}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Items used on job cards cannot be deleted.`}
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
