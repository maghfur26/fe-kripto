import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Archives from './pages/Archives.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Logs from './pages/Logs.jsx';
import Simulasi from './pages/Simulasi.jsx';
import Upload from './pages/Upload.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/simulasi" element={<Simulasi />} />

          <Route element={<AdminRoute />}>
            <Route path="/users" element={<Users />} />
            <Route path="/logs" element={<Logs />} />
          </Route>
        </Route>

        <Route path="/enkripsi" element={<Navigate to="/upload" replace />} />
        <Route path="/dekripsi" element={<Navigate to="/archives" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
