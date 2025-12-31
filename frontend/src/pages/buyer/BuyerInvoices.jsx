import { useState, useEffect } from 'react';
import { FileText, Download, User, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';
import { generateInvoicePDF } from '../../utils/invoicePDF';

export default function BuyerInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const { addToast } = useToast();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/buyer/invoices');
            setInvoices(response.data.data.invoices);
        } catch (error) {
            addToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (invoice) => {
        const buyerName = 'Your Company';
        const farmerName = invoice.farmer?.full_name || 'Farmer';
        generateInvoicePDF(invoice, buyerName, farmerName);
        addToast('Invoice downloaded successfully!', 'success');
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'ALL') return true;
        return inv.status === filter;
    });

    const columns = [
        {
            header: 'Invoice #',
            render: (inv) => (
                <span className="font-mono text-sm font-medium">{inv.invoice_number}</span>
            )
        },
        {
            header: 'Date',
            render: (inv) => new Date(inv.date).toLocaleDateString('en-IN')
        },
        {
            header: 'Farmer',
            render: (inv) => (
                <div>
                    <p className="font-medium">{inv.farmer?.full_name || '-'}</p>
                    <p className="text-sm text-gray-500">{inv.farmer?.phone_number || ''}</p>
                </div>
            )
        },
        {
            header: 'Amount',
            render: (inv) => (
                <span className="font-semibold text-gray-900">
                    ₹{inv.grand_total?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            header: 'Status',
            render: (inv) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {inv.status}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (inv) => (
                <Button
                    size="sm"
                    variant="secondary"
                    icon={Download}
                    onClick={() => handleDownloadPDF(inv)}
                >
                    Download PDF
                </Button>
            )
        }
    ];

    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
    const paidAmount = filteredInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
    const pendingAmount = filteredInvoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-600">View and download generated invoices</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {filteredInvoices.length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">
                                ₹{paidAmount.toFixed(2)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-2">
                                ₹{pendingAmount.toFixed(2)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Card>
                <div className="flex gap-2 mb-4">
                    {['ALL', 'PAID', 'PENDING'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <Table
                    columns={columns}
                    data={filteredInvoices}
                    loading={loading}
                    emptyMessage="No invoices found"
                />
            </Card>
        </div>
    );
}
