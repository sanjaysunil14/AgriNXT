import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forbidden from './pages/Forbidden';
import AdminGuard from './components/guards/AdminGuard';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import UserApprovals from './pages/admin/UserApprovals';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';

// Protected Route Component
function ProtectedRoute({ children }) {
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forbidden" element={<Forbidden />} />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminGuard>
                                    <AdminLayout />
                                </AdminGuard>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="approvals" element={<UserApprovals />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Legacy admin dashboard route - redirect to new admin */}
                    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

                    {/* Placeholder routes for other roles */}
                    <Route path="/buyer/dashboard" element={<div className="p-8 text-center">Buyer Dashboard - Coming Soon</div>} />
                    <Route path="/farmer/dashboard" element={<div className="p-8 text-center">Farmer Dashboard - Coming Soon</div>} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
