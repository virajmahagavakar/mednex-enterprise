import React, { useState, useEffect } from 'react';
import {
    Store,
    AlertTriangle,
    Clock,
    IndianRupee,
    Beaker
} from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import type { PharmacyDashboardStatsDTO, PharmacyPrescriptionDTO } from '../../services/api.types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PharmacyDashboard: React.FC = () => {
    const [stats, setStats] = useState<PharmacyDashboardStatsDTO | null>(null);
    const [pendingPrescriptions, setPendingPrescriptions] = useState<PharmacyPrescriptionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await PharmacyService.getDashboardStats();
            setStats(data);

            const pendingData = await PharmacyService.getPendingPrescriptions();
            setPendingPrescriptions(pendingData.slice(0, 5)); // Just show top 5 on dashboard
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
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Recent Pending Prescriptions</h3>
                        <button
                            onClick={() => navigate('/pharmacist/dispense')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All Dispensing Station
                        </button>
                    </div>
                    <div className="p-0">
                        {pendingPrescriptions.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No pending prescriptions at the moment</div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {pendingPrescriptions.map((prescription) => (
                                    <li key={prescription.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-gray-900">{prescription.patientName}</p>
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                {prescription.status}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex justify-between text-sm text-gray-500">
                                            <p>Dr. {prescription.doctorName}</p>
                                            <p>{new Date(prescription.prescriptionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow border border-gray-200 p-6 h-64 flex items-center justify-center relative overflow-hidden group">
                    <p className="text-gray-400 z-10 transition-transform group-hover:scale-105">Inventory Status Chart (Coming Soon)</p>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
