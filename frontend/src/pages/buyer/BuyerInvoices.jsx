import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock } from 'lucide-react';
import Table from '../../components/ui/Table';
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
            header: 'Invoice ID',
            render: (inv) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900">{inv.invoice_number}</span>
                </div>
            )
        },
        {
            header: 'Date',
            render: (inv) => <span className="text-gray-600 font-medium">{new Date(inv.date).toLocaleDateString('en-IN')}</span>
        },
        {
            header: 'Farmer',
            render: (inv) => <span className="font-bold text-gray-800">{inv.farmer?.full_name || '-'}</span>
        },
        {
            header: 'Amount',
            render: (inv) => (
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                    ₹{inv.grand_total?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            header: 'Status',
            render: (inv) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${inv.status === 'PAID'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {inv.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {inv.status}
                </span>
            )
        },
        {
            header: 'Export',
            render: (inv) => (
                <button
                    onClick={() => handleDownloadPDF(inv)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Download PDF"
                >
                    <Download className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoice History</h1>
                    <p className="text-gray-500">Record of all generated purchase invoices</p>
                </div>
                <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                    {['ALL', 'PAID', 'PENDING'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === status
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    data={filteredInvoices}
                    loading={loading}
                    emptyMessage="No invoices found matching criteria"
                />
            </div>
        </div>
    );
}