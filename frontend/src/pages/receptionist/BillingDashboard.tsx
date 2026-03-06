import React, { useState } from 'react';
import { CreditCard, FileText, Search, Printer, DollarSign } from 'lucide-react';

// Mock data for UI placeholder
const mockInvoices = [
    { id: 'INV-2026-001', patient: 'Rahul Sharma', date: '2026-03-06', amount: 1250.00, status: 'PENDING' },
    { id: 'INV-2026-002', patient: 'Priya Patel', date: '2026-03-06', amount: 850.50, status: 'PAID' },
    { id: 'INV-2026-003', patient: 'Amit Singh', date: '2026-03-05', amount: 4500.00, status: 'PENDING' }
];

const BillingDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing & Invoicing</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage patient invoices and process payments
                    </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    New Invoice
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-200">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-center">
                        <DollarSign className="h-6 w-6 text-yellow-500 mr-2" />
                        ₹5,750.00
                    </dd>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-200">
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-center">
                        <DollarSign className="h-6 w-6 text-green-500 mr-2" />
                        ₹850.50
                    </dd>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-200">
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Invoices</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-center">
                        <FileText className="h-6 w-6 text-red-500 mr-2" />
                        2
                    </dd>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h3>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice / Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-blue-600">{invoice.id}</div>
                                        <div className="text-sm text-gray-500">{invoice.date}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{invoice.patient}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        ₹{invoice.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-gray-500 mx-2">
                                            <Printer className="h-5 w-5" />
                                        </button>
                                        {invoice.status === 'PENDING' && (
                                            <button className="text-blue-600 hover:text-blue-900 font-semibold">
                                                Process Payment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                <p className="text-sm">
                    <strong>Phase 3 Notice:</strong> This is a foundational view for the Billing module. Automated invoice generation from clinical appointments and pharmacy dispensing will be integrated with the live backend in the next phase.
                </p>
            </div>
        </div>
    );
};

export default BillingDashboard;
