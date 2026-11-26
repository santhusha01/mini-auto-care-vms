import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { fetchServices, type ServiceItem } from '../../api/servicesApi';

export interface ServicePickerProps {
  selectedIds: number[];
  onChange: (selectedIds: number[], selectedServices: ServiceItem[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatPrice(price: number): string {
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ServicePicker({
  selectedIds,
  onChange,
  disabled = false,
  placeholder = 'Search active services...',
}: ServicePickerProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadActiveServices() {
      setLoading(true);
      setError(null);
      try {
        const pageData = await fetchServices({
          active: true,
          page: 0,
          size: 100,
        });
        if (!cancelled) {
          setServices(pageData.content ?? []);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load active services');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActiveServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, search]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedSet.has(s.id)),
    [services, selectedSet]
  );

  const estimatedTotal = useMemo(
    () => selectedServices.reduce((sum, s) => sum + Number(s.price), 0),
    [selectedServices]
  );

  function toggleService(service: ServiceItem) {
    if (disabled) return;
    const nextIds = selectedSet.has(service.id)
      ? selectedIds.filter((id) => id !== service.id)
      : [...selectedIds, service.id];

    const nextSelected = services.filter((s) => nextIds.includes(s.id));
    onChange(nextIds, nextSelected);
  }

  function removeService(id: number) {
    if (disabled) return;
    const nextIds = selectedIds.filter((itemId) => itemId !== id);
    const nextSelected = services.filter((s) => nextIds.includes(s.id));
    onChange(nextIds, nextSelected);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            disabled={disabled}
            aria-label="Clear search"
            className="text-gray-400 hover:text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedServices.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              <span>{service.name}</span>
              <span className="text-blue-500">({formatPrice(service.price)})</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeService(service.id)}
                  aria-label={`Remove ${service.name}`}
                  className="hover:text-blue-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white">
        {loading ? (
          <div className="p-4 text-sm text-gray-500 text-center">Loading active services...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 text-center">{error}</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">No matching active services</div>
        ) : (
          filteredServices.map((service) => {
            const isSelected = selectedSet.has(service.id);
            return (
              <button
                key={service.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleService(service)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-gray-500 truncate">{service.description}</div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800 shrink-0 tabular-nums">
                  {formatPrice(service.price)}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
        <span>Selected: {selectedIds.length}</span>
        <span className="font-medium text-gray-800 tabular-nums">
          Services Subtotal: {formatPrice(estimatedTotal)}
        </span>
      </div>
    </div>
  );
}
