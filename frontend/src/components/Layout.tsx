import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  Wrench,
  FileText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/job-cards', label: 'Job Cards', icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/invoices', label: 'Invoices', icon: FileText },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentTitle =
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Mini Auto Care';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar (#0F2A43) */}
      <aside className="flex w-60 flex-col bg-[#0F2A43] text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
            MA
          </span>
          <span className="text-base font-semibold tracking-tight">Mini Auto Care</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <span className="text-xs font-medium text-slate-500">{currentTitle}</span>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {user?.fullName ?? 'User'}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {user?.role ?? 'STAFF'}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}