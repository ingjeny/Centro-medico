import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../modules/auth/pages/LoginPage';
import DashboardPage from '../modules/dashboard/DashboardPage';
import PacientesPage from '../modules/pacientes/pages/PacientesPage';
import PacienteDetallePage from '../modules/pacientes/pages/PacienteDetallePage';
import CitasPage from '../modules/citas/pages/CitasPage';
import HistoriasPage from '../modules/historias/pages/HistoriasPage';
import NuevaHistoriaPage from '../modules/historias/pages/NuevaHistoriaPage';
import DetalleHistoriaPage from '../modules/historias/pages/DetalleHistoriaPage';
import UsuariosPage from '../modules/usuarios/pages/UsuariosPage';
import ConfiguracionPage from '../modules/configuracion/pages/ConfiguracionPage';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="pacientes" element={<PacientesPage />} />
          <Route path="pacientes/:id" element={<PacienteDetallePage />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="historias" element={<HistoriasPage />} />
          <Route path="historias/nueva" element={
            <PrivateRoute roles={['admin', 'doctor']}>
              <NuevaHistoriaPage />
            </PrivateRoute>
          } />
          <Route path="historias/:id" element={<DetalleHistoriaPage />} />
          <Route path="usuarios" element={
            <PrivateRoute roles={['admin']}>
              <UsuariosPage />
            </PrivateRoute>
          } />
          <Route path="configuracion" element={
            <PrivateRoute roles={['admin', 'doctor']}>
              <ConfiguracionPage />
            </PrivateRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
