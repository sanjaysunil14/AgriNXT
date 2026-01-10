import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';
import { generateInvoicePDF } from '../../utils/invoicePDF';

export default function InvoiceManagement() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const LIMIT = 4;
    const { addToast } = useToast();

    useEffect(() => {
        // Reset everything when filters change
        setOffset(0);
        setInvoices([]); // Clear current list
        fetchInvoices(0, false);
    }, [statusFilter, selectedDate, userTypeFilter]);

    const fetchInvoices = async (currentOffset, append = false) => {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = {
                limit: LIMIT,
                offset: currentOffset,
                userType: currentOffsetuserTypeFilter
            };

            if (statusFilter) params.status = statusFilter;

            if (selectedDate) {
                params.startDate = selectedDate;
                params.endDate = selectedDate;
            }

            const response = await api.get('/admin/invoices', { params });
            const newInvoices = response.data.data.invoices;

            if (append) {
                setInvoices(prev => [...prev, ...newInvoices]);
            } else {
                setInvoices(newInvoices);
            }

            setHasMore(response.data.data.hasMore);
        } catch (error) {
            console.error('Fetch invoices error:', error);
            addToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleShowMore = () => {
        const newOffset = offset + LIMIT;
        setOffset(newOffset);
        fetchInvoices(newOffset, true);
    };

    const handleDownloadPDF = (invoice) => {
        try {
            const buyerName = invoice.buyer?.business_name || invoice.buyer?.full_name || 'Buyer';
            const farmerName = invoice.farmer?.full_name || 'Farmer';
            generateInvoicePDF(invoice, buyerName, farmerName);
            addToast('Invoice PDF downloaded successfully!', 'success');
        } catch (error) {
            addToast('Failed to download invoice PDF', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
            PAID: 'bg-green-100 text-green-800 border border-green-300',
            CANCELLED: 'bg-red-100 text-red-800 border border-red-300'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
                {status}
            </span>
        );
    };

    const columns = [
        {
            header: 'Invoice #',
            render: (invoice) => (
                <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
            )
        },
        {
            header: 'Date',
            render: (invoice) => formatDate(invoice.date)
        },
        {
            header: 'Buyer',
            render: (invoice) => (
                <div>
                    <div className="font-medium text-gray-900">{invoice.buyer.business_name || invoice.buyer.full_name}</div>
                    <div className="text-xs text-gray-500">{invoice.buyer.full_name}</div>
                </div>
            )
        },
        {
            header: 'Farmer',
            render: (invoice) => (
                <div>
                    <div className="font-medium text-gray-900">{invoice.farmer.full_name}</div>
                    <div className="text-xs text-gray-500">{invoice.farmer.phone_number}</div>
                </div>
            )
        },
        {
            header: 'Amount',
            render: (invoice) => (
                <span className="font-bold text-gray-900">₹{invoice.grand_total.toFixed(2)}</span>
            )
        },
        {
            header: 'Status',
            render: (invoice) => getStatusBadge(invoice.status)
        },
        {
            header: 'Actions',
            render: (invoice) => (
                <Button
                    size="sm"
                    variant="primary"
                    icon={Download}
                    onClick={() => handleDownloadPDF(invoice)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Download PDF
                </Button>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                <p className="text-gray-600 mt-1">View and manage all invoices from all buyers</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* User Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Type
                        </label>
                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">All Users</option>
                            <option value="FARMER">Farmer</option>
                            <option value="BUYER">Buyer</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Invoice Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setStatusFilter('');
                                setSelectedDate('');
                                setUserTypeFilter('');
                            }}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-5 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-900">All Invoices</h2>
                </div>

                <Table
                    columns={columns}
                    data={invoices}
                    loading={loading}
                    emptyMessage="No invoices found"
                />

                {/* Show More Button */}
                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="secondary"
                            onClick={handleShowMore}
                            disabled={loadingMore}
                            className="px-8"
                        >
                            {loadingMore ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </span>
                            ) : (
                                'Show More'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
