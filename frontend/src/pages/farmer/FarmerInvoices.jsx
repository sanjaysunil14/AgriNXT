import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';
import { generateInvoicePDF } from '../../utils/invoicePDF';

export default function FarmerInvoices() {
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
            const response = await api.get('/farmer/invoices');
            setInvoices(response.data.data.invoices);
        } catch (error) {
            addToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (invoice) => {
        const buyerName = invoice.buyer?.business_name || invoice.buyer?.full_name || 'Buyer';
        const farmerName = invoice.farmer?.full_name || 'You';
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
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900">{inv.invoice_number}</span>
                </div>
            )
        },
        {
            header: 'Date',
            render: (inv) => new Date(inv.date).toLocaleDateString('en-IN')
        },
        {
            header: 'Buyer',
            render: (inv) => <span className="font-medium text-gray-700">{inv.buyer?.business_name || inv.buyer?.full_name || '-'}</span>
        },
        {
            header: 'Gross Amount',
            render: (inv) => (
                <span className="font-semibold text-gray-700">
                    ₹{inv.grand_total?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            header: 'Commission (1%)',
            render: (inv) => {
                const commission = (inv.grand_total || 0) * 0.01;
                return (
                    <span className="text-red-600 font-medium">
                        - ₹{commission.toFixed(2)}
                    </span>
                );
            }
        },
        {
            header: 'Net Payable',
            render: (inv) => {
                const commission = (inv.grand_total || 0) * 0.01;
                const netPayable = (inv.grand_total || 0) - commission;
                return (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        ₹{netPayable.toFixed(2)}
                    </span>
                );
            }
        },
        {
            header: 'Status',
            render: (inv) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${inv.status === 'PAID'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {inv.status}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (inv) => (
                <button
                    onClick={() => handleDownloadPDF(inv)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Download PDF"
                >
                    <Download className="w-5 h-5" />
                </button>
            )
        }
    ];

    // Calculate net amounts after 1% commission
    const paidAmount = filteredInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => {
            const commission = (inv.grand_total || 0) * 0.01;
            return sum + ((inv.grand_total || 0) - commission);
        }, 0);
    const pendingAmount = filteredInvoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => {
            const commission = (inv.grand_total || 0) * 0.01;
            return sum + ((inv.grand_total || 0) - commission);
        }, 0);
    const totalCommission = filteredInvoices
        .reduce((sum, inv) => sum + ((inv.grand_total || 0) * 0.01), 0);

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-500">Financial records and payments</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Invoices</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{filteredInvoices.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Paid (Net)</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">₹{paidAmount.toFixed(2)}</h3>
                        <p className="text-xs text-gray-400 mt-1">After commission</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pending (Net)</p>
                        <h3 className="text-3xl font-bold text-amber-500 mt-1">₹{pendingAmount.toFixed(2)}</h3>
                        <p className="text-xs text-gray-400 mt-1">After commission</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Commission</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">₹{totalCommission.toFixed(2)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Platform fee (1%)</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-fit">
                        {['ALL', 'PAID', 'PENDING'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filter === status
                                    ? 'bg-white text-emerald-600 shadow-sm transform scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredInvoices}
                    loading={loading}
                    emptyMessage="No invoices found matching your filter"
                />
            </div>
        </div>
    );
}