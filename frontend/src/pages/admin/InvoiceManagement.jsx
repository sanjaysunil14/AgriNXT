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
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter, selectedDate]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) {
                params.status = statusFilter;
            }
            if (selectedDate) {
                // Send the same date as both start and end to get invoices for that specific day
                params.startDate = selectedDate;
                params.endDate = selectedDate;
            }

            const response = await api.get('/admin/invoices', { params });
            setInvoices(response.data.data.invoices);
        } catch (error) {
            addToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
        }
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
        </div>
    );
}
