import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModulePlaceholder from './pages/ModulePlaceholder';
import ServicesPage from './pages/ServicesPage';
import InventoryPage from './pages/InventoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers/*" element={<ModulePlaceholder title="Customers" owner="Dev 2" />} />
            <Route path="job-cards/*" element={<ModulePlaceholder title="Job Cards" owner="Dev 2" />} />
            <Route path="inventory/*" element={<InventoryPage />} />
            <Route path="services/*" element={<ServicesPage />} />
            <Route path="invoices/*" element={<ModulePlaceholder title="Invoices" owner="Dev 5" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}