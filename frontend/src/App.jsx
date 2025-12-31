import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forbidden from './pages/Forbidden';
import AdminGuard from './components/guards/AdminGuard';
import FarmerGuard from './components/guards/FarmerGuard';
import BuyerGuard from './components/guards/BuyerGuard';
import AdminLayout from './layouts/AdminLayout';
import FarmerLayout from './layouts/FarmerLayout';
import BuyerLayout from './layouts/BuyerLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import UserApprovals from './pages/admin/UserApprovals';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerHistory from './pages/farmer/FarmerHistory';
import FarmerProfile from './pages/farmer/FarmerProfile';
import FarmerInvoices from './pages/farmer/FarmerInvoices';
import BuyerFieldRoute from './pages/buyer/BuyerFieldRoute';
import BuyerPricing from './pages/buyer/BuyerPricing';
import BuyerPayments from './pages/buyer/BuyerPayments';
import BuyerInvoices from './pages/buyer/BuyerInvoices';
import SetDailyPrices from './pages/admin/SetDailyPrices';
import InvoiceManagement from './pages/admin/InvoiceManagement';

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
                        <Route path="set-prices" element={<SetDailyPrices />} />
                        <Route path="invoices" element={<InvoiceManagement />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Legacy admin dashboard route - redirect to new admin */}
                    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

                    {/* Farmer routes */}
                    <Route
                        path="/farmer"
                        element={
                            <ProtectedRoute>
                                <FarmerGuard>
                                    <FarmerLayout />
                                </FarmerGuard>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<FarmerDashboard />} />
                        <Route path="history" element={<FarmerHistory />} />
                        <Route path="invoices" element={<FarmerInvoices />} />
                        <Route path="profile" element={<FarmerProfile />} />
                    </Route>

                    {/* Buyer routes */}
                    <Route
                        path="/buyer"
                        element={
                            <ProtectedRoute>
                                <BuyerGuard>
                                    <BuyerLayout />
                                </BuyerGuard>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<BuyerFieldRoute />} />
                        <Route path="pricing" element={<BuyerPricing />} />
                        <Route path="payments" element={<BuyerPayments />} />
                        <Route path="invoices" element={<BuyerInvoices />} />
                    </Route>

                    {/* Legacy buyer dashboard route - redirect to new buyer */}
                    <Route path="/buyer/dashboard" element={<Navigate to="/buyer" replace />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
