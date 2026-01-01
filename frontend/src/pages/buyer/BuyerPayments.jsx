import { useState, useEffect } from 'react';
import { Wallet, User, Phone, CheckCircle2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/buyer/PaymentModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function BuyerPayments() {
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchDues();
    }, []);

    const fetchDues = async () => {
        setLoading(true);
        try {
            const response = await api.get('/buyer/dues');
            setDues(response.data.data.dues);
        } catch (error) {
            addToast('Failed to fetch dues', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = (farmer) => {
        setSelectedFarmer(farmer);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        addToast('Payment recorded successfully!', 'success');
        setPaymentModalOpen(false);
        setSelectedFarmer(null);
        fetchDues();
    };

    const duesColumns = [
        {
            header: 'Farmer Details',
            render: (farmer) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {farmer.farmer_name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{farmer.farmer_name}</p>
                        <p className="text-xs text-gray-500">ID: {farmer.farmer_id}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Payment Preference',
            render: (farmer) => (
                <div className="text-sm">
                    {farmer.payment_method ? (
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-200">
                            <p className="font-bold text-gray-700 text-xs uppercase">{farmer.payment_method}</p>
                            <p className="text-gray-500 font-mono text-xs">{farmer.payment_value}</p>
                        </div>
                    ) : (
                        <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded">Not Set</span>
                    )}
                </div>
            )
        },
        {
            header: 'Outstanding Balance',
            render: (farmer) => (
                <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    ₹{farmer.balance.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Action',
            render: (farmer) => (
                <Button
                    size="sm"
                    onClick={() => handlePay(farmer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 rounded-lg px-4"
                >
                    Pay Now
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                    <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Center</h1>
                    <p className="text-gray-500">Settle outstanding dues with farmers</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Farmers Pending', value: dues.length, icon: User, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { title: 'Total Liability', value: `₹${dues.reduce((sum, f) => sum + f.balance, 0).toFixed(2)}`, icon: Wallet, color: 'text-red-600', bg: 'bg-red-100' },
                    { title: 'Avg. Ticket Size', value: `₹${dues.length > 0 ? (dues.reduce((sum, f) => sum + f.balance, 0) / dues.length).toFixed(0) : '0'}`, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Outstanding List</h2>
                </div>
                <Table
                    columns={duesColumns}
                    data={dues}
                    loading={loading}
                    emptyMessage={
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
                            <p className="text-gray-500">No outstanding payments found.</p>
                        </div>
                    }
                />
            </div>

            {selectedFarmer && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedFarmer(null);
                    }}
                    farmer={selectedFarmer}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}