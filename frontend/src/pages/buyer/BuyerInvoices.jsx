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
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Additional filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [farmerName, setFarmerName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const LIMIT = 4;
    const { addToast } = useToast();

    useEffect(() => {
        setInvoices([]);
        setOffset(0);
        setHasMore(false);
        fetchInvoices(true);
    }, [filter, startDate, endDate, farmerName, invoiceNumber]);

    const fetchInvoices = async (isInitial = false) => {
        setLoading(true);
        try {
            const currentOffset = isInitial ? 0 : offset;
            const statusParam = filter !== 'ALL' ? `&status=${filter}` : '';
            const dateParams = startDate ? `&startDate=${startDate}` : '';
            const endDateParam = endDate ? `&endDate=${endDate}` : '';
            const farmerParam = farmerName ? `&farmerName=${encodeURIComponent(farmerName)}` : '';
            const invoiceParam = invoiceNumber ? `&invoiceNumber=${encodeURIComponent(invoiceNumber)}` : '';

            const response = await api.get(`/buyer/invoices?limit=${LIMIT}&offset=${currentOffset}${statusParam}${dateParams}${endDateParam}${farmerParam}${invoiceParam}`);

            if (response.data.success) {
                const newInvoices = response.data.data.invoices;
                const moreAvailable = response.data.data.hasMore;

                if (isInitial) {
                    setInvoices(newInvoices);
                } else {
                    setInvoices(prev => [...prev, ...newInvoices]);
                }

                setHasMore(moreAvailable);
                if (newInvoices.length > 0) {
                    setOffset(currentOffset + LIMIT);
                }
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            addToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchInvoices(false);
    };

    const handleDownloadPDF = (invoice) => {
        const buyerName = 'Your Company';
        const farmerName = invoice.farmer?.full_name || 'Farmer';
        generateInvoicePDF(invoice, buyerName, farmerName);
        addToast('Invoice downloaded successfully!', 'success');
    };

    // No client-side filtering needed anymore
    const filteredInvoices = invoices;

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
            header: 'Total Amount',
            render: (inv) => {
                // grand_total is net amount, reverse calculate gross amount
                const grossAmount = (inv.grand_total || 0) / 0.99;
                return (
                    <span className="font-semibold text-gray-700">
                        ₹{grossAmount.toFixed(2)}
                    </span>
                );
            }
        },
        {
            header: 'Commission (1%)',
            render: (inv) => {
                // grand_total already has commission deducted, so reverse calculate
                const commission = (inv.grand_total || 0) * 0.01 / 0.99;
                return (
                    <span className="text-amber-600 font-medium text-sm">
                        ₹{commission.toFixed(2)}
                    </span>
                );
            }
        },
        {
            header: 'Net to Farmer',
            render: (inv) => {
                // grand_total already has commission deducted in backend
                return (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm">
                        ₹{(inv.grand_total || 0).toFixed(2)}
                    </span>
                );
            }
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
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
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
            </div>

            {/* Commission Info Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-amber-900 font-bold text-sm">Platform Commission</p>
                        <p className="text-amber-700 text-xs">A 1% platform fee is deducted from each invoice. You pay the full amount, farmers receive 99%.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* Filter Tabs */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
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

                        {/* Additional Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                type="text"
                                placeholder="Search Invoice #"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Search Farmer Name"
                                value={farmerName}
                                onChange={(e) => setFarmerName(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <input
                                type="date"
                                placeholder="From Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <input
                                type="date"
                                placeholder="To Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        {/* Clear Filters Button */}
                        {(invoiceNumber || farmerName || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setInvoiceNumber('');
                                    setFarmerName('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={filteredInvoices}
                        loading={loading}
                        emptyMessage="No invoices found matching criteria"
                    />
                </div>

                {hasMore && (
                    <div className="flex justify-center p-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>Show More</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}