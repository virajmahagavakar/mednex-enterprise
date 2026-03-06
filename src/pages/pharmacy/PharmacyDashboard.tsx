import React, { useState, useEffect } from 'react';
import {
    Store,
    AlertTriangle,
    Clock,
    IndianRupee,
    Beaker
} from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import type { PharmacyDashboardStatsDTO } from '../../services/api.types';
import toast from 'react-hot-toast';

const PharmacyDashboard: React.FC = () => {
    const [stats, setStats] = useState<PharmacyDashboardStatsDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await PharmacyService.getDashboardStats();
            setStats(data);
        } catch (error) {
            toast.error('Failed to load pharmacy statistics');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            name: 'Total Medicines',
            value: stats?.totalMedicines || 0,
            icon: Beaker,
            color: 'bg-blue-50 text-blue-700',
        },
        {
            name: 'Low Stock Alerts',
            value: stats?.lowStockAlerts || 0,
            icon: AlertTriangle,
            color: 'bg-red-50 text-red-700',
            urgent: (stats?.lowStockAlerts || 0) > 0
        },
        {
            name: 'Expiring Soon',
            value: stats?.expiringSoonAlerts || 0,
            icon: Clock,
            color: 'bg-yellow-50 text-yellow-700',
            urgent: (stats?.expiringSoonAlerts || 0) > 0
        },
        {
            name: 'Pending Prescriptions',
            value: stats?.pendingPrescriptions || 0,
            icon: Store,
            color: 'bg-purple-50 text-purple-700',
        },
        {
            name: 'Today\'s Revenue',
            value: `₹${stats?.todayRevenue?.toFixed(2) || '0.00'}`,
            icon: IndianRupee,
            color: 'bg-green-50 text-green-700',
        },
    ];

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading statistics...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of pharmacy inventory and daily operations
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((item) => (
                    <div
                        key={item.name}
                        className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border transition-shadow hover:shadow-md ${item.urgent ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'
                            }`}
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">
                                {item.name}
                            </p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-gray-900">
                                {item.value}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Quick Action Hints or Recent Activity could go here */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Placeholder for future charts or lists */}
                <div className="bg-white rounded-xl shadow border border-gray-200 p-6 h-64 flex items-center justify-center">
                    <p className="text-gray-400">Recent Transactions Chart (Coming Soon)</p>
                </div>
                <div className="bg-white rounded-xl shadow border border-gray-200 p-6 h-64 flex items-center justify-center">
                    <p className="text-gray-400">Inventory Status Chart (Coming Soon)</p>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
