interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${styles}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-xs font-bold opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}