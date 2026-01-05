import { Trophy, User, TrendingUp, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ZONE_COLORS = {
    NORTH: 'bg-blue-100 text-blue-700 border-blue-200',
    SOUTH: 'bg-orange-100 text-orange-700 border-orange-200',
    EAST: 'bg-green-100 text-green-700 border-green-200',
    WEST: 'bg-purple-100 text-purple-700 border-purple-200'
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function FarmerLeaderboard() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/analytics/farmer-leaderboard?limit=10');
            setFarmers(response.data.data.farmers);
        } catch (error) {
            console.error('Failed to fetch farmer leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Farmer Performance Leaderboard</h3>
                </div>
                <div className="h-96 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (farmers.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Farmer Performance Leaderboard</h3>
                </div>
                <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                    <User className="w-16 h-16 mb-3" />
                    <p>No farmer data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg shadow-md">
                    <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Farmer Performance Leaderboard</h3>
                    <p className="text-xs text-gray-500">Top 10 by total supply</p>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {farmers.map((farmer, index) => (
                    <div
                        key={farmer.id}
                        className="group relative bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 text-center">
                                {index < 3 ? (
                                    <span className="text-3xl">{RANK_MEDALS[index]}</span>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {farmer.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 truncate">{farmer.name}</h4>
                                    {farmer.zone && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ZONE_COLORS[farmer.zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {farmer.zone}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="font-semibold text-purple-600">{farmer.totalSupply.toFixed(2)} KG</span>
                                    <span>{farmer.bookingsCount} bookings</span>
                                </div>
                            </div>

                            {/* Reliability Score */}
                            <div className="flex-shrink-0 text-right">
                                <div className="text-xs text-gray-500 mb-1">Reliability</div>
                                <div className="relative w-16 h-16">
                                    <svg className="transform -rotate-90 w-16 h-16">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="#e5e7eb"
                                            strokeWidth="6"
                                            fill="none"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="#8b5cf6"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - farmer.reliabilityScore / 100)}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-purple-600">{farmer.reliabilityScore}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
