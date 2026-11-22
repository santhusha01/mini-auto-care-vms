import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Pencil,
  Trash2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import InventoryFormModal from '../components/inventory/InventoryFormModal';
import StockAdjustModal, { type StockMode } from '../components/inventory/StockAdjustModal';
import { useAuth } from '../auth/AuthContext';
import {
  adjustInventoryStock,
  createInventoryItem,
  deleteInventoryItem,
  fetchInventory,
  updateInventoryItem,
  type InventoryItem,
  type InventoryRequest,
  type StockAdjustRequest,
} from '../api/inventoryApi';

export default function InventoryPage() {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Admin Create/Edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Stock-In / Stock-Out modal state
  const [stockTarget, setStockTarget] = useState<InventoryItem | null>(null);
  const [stockMode, setStockMode] = useState<StockMode>('IN');

  // Admin Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadInventory = useCallback(async () => {
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
        'Failed to load inventory items.';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, lowStockOnly, page]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleOpenStockModal = (item: InventoryItem, mode: StockMode) => {
    setStockTarget(item);
    setStockMode(mode);
  };

  const handleSaveItem = async (payload: InventoryRequest) => {
    if (editingItem) {
      await updateInventoryItem(editingItem.id, payload);
      setToast({ message: 'Inventory item updated successfully.', type: 'success' });
    } else {
      await createInventoryItem(payload);
      setToast({ message: 'Inventory item created successfully.', type: 'success' });
    }
    await loadInventory();
  };

  const handleAdjustStock = async (id: number, payload: StockAdjustRequest) => {
    const updated = await adjustInventoryStock(id, payload);
    setToast({
      message: `Updated ${updated.code} stock to ${updated.quantity} units.`,
      type: 'success',
    });
    await loadInventory();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInventoryItem(deleteTarget.id);
      setToast({ message: `Deleted "${deleteTarget.name}".`, type: 'success' });
      setDeleteTarget(null);
      await loadInventory();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to delete inventory item.';
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

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Code',
      render: (row) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Item Name',
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      header: 'Unit Price',
      render: (row) => (
        <span className="font-mono font-medium text-slate-800">{formatLkr(row.unitPrice)}</span>
      ),
    },
    {
      header: 'In Stock',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-mono font-semibold ${
              row.lowStock ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {row.quantity}
          </span>
          <span className="text-xs text-slate-400">(min {row.reorderLevel})</span>
          {row.lowStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          {/* Stock-In: Available for both STAFF and ADMIN (MAC-43) */}
          <button
            onClick={() => handleOpenStockModal(row, 'IN')}
            title="Add stock"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Stock In
          </button>

          {/* Admin-only actions (MAC-44) */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenStockModal(row, 'OUT')}
                disabled={row.quantity === 0}
                title="Deduct / adjust stock (Admin)"
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-40"
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" />
                Stock Out
              </button>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit item details (Admin)"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                title="Delete item (Admin)"
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Spare Parts & Inventory"
        subtitle="Track stock levels, restock parts, and monitor low-stock alerts."
        action={
          isAdmin ? (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Item
            </button>
          ) : undefined
        }
      />

      {/* Search & Low-Stock Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by item code (ITM-...) or name..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setLowStockOnly((prev) => !prev);
            setPage(0);
          }}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
            lowStockOnly
              ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle
            className={`h-4 w-4 ${lowStockOnly ? 'text-amber-600' : 'text-slate-400'}`}
          />
          Low Stock Only
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading inventory...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          emptyMessage={
            lowStockOnly
              ? 'No low-stock items found. All stock levels are healthy.'
              : 'No inventory items found matching your search.'
          }
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

      {/* Stock-In / Stock-Out Modal */}
      <StockAdjustModal
        open={Boolean(stockTarget)}
        item={stockTarget}
        mode={stockMode}
        onClose={() => setStockTarget(null)}
        onSubmit={handleAdjustStock}
      />

      {/* Admin Create / Edit Item Modal */}
      <InventoryFormModal
        open={formOpen}
        initialData={editingItem}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveItem}
      />

      {/* Admin Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})? Items referenced in existing job cards cannot be deleted.`}
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
