import { useState, useEffect } from 'react';
import { Wallet, User, Phone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
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
            header: 'Farmer',
            render: (farmer) => (
                <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {farmer.farmer_name}
                    </p>
                </div>
            )
        },
        {
            header: 'Payment Method',
            render: (farmer) => (
                <div className="text-sm">
                    {farmer.payment_method ? (
                        <>
                            <p className="font-medium text-gray-900">{farmer.payment_method}</p>
                            <p className="text-gray-600">{farmer.payment_value}</p>
                        </>
                    ) : (
                        <span className="text-gray-400">Not set</span>
                    )}
                </div>
            )
        },
        {
            header: 'Outstanding Balance',
            render: (farmer) => (
                <span className="text-lg font-bold text-red-600">
                    ₹{farmer.balance.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (farmer) => (
                <Button
                    size="sm"
                    variant="primary"
                    icon={Wallet}
                    onClick={() => handlePay(farmer)}
                >
                    Pay
                </Button>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-600">Manage farmer payments and outstanding dues</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Farmers with Dues</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {dues.length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                ₹{dues.reduce((sum, farmer) => sum + farmer.balance, 0).toFixed(2)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Due</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                ₹{dues.length > 0 ? (dues.reduce((sum, farmer) => sum + farmer.balance, 0) / dues.length).toFixed(2) : '0.00'}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Dues Table */}
            <Card>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Outstanding Payments</h2>
                    <p className="text-sm text-gray-600">Farmers with pending dues</p>
                </div>

                <Table
                    columns={duesColumns}
                    data={dues}
                    loading={loading}
                    emptyMessage="No outstanding payments. All farmers are paid up!"
                />
            </Card>

            {/* Payment Modal */}
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
