import React, { useState } from 'react';
import { CreditCard, FileText, Search, Printer, DollarSign, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';

// Mock data for UI placeholder
const mockInvoices = [
    { id: 'INV-2026-001', patient: 'Rahul Sharma', date: '2026-03-06', amount: 1250.00, status: 'PENDING' },
    { id: 'INV-2026-002', patient: 'Priya Patel', date: '2026-03-06', amount: 850.50, status: 'PAID' },
    { id: 'INV-2026-003', patient: 'Amit Singh', date: '2026-03-05', amount: 4500.00, status: 'PENDING' }
];

const BillingDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Billing & Invoicing</h1>
                    <p className="page-description">Manage patient invoices, process payments, and track revenue.</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    <CreditCard size={18} />
                    <span>Generate New Invoice</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Outstanding</span>
                        <span className="stat-value">₹5,750.00</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Today's Revenue</span>
                        <span className="stat-value">₹850.50</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Invoices</span>
                        <span className="stat-value">2</span>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="card">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ gap: '0.5rem' }}><FileText size={20} className="text-primary" /> Recent Invoices</h3>
                    <div className="search-bar" style={{ width: '300px' }}>
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by invoice or patient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice / Date</th>
                                <th>Patient</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{invoice.id}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{invoice.date}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{invoice.patient}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge-sm ${invoice.status === 'PAID' ? 'status-success' : 'status-pending'
                                            }`} style={{ 
                                                backgroundColor: invoice.status === 'PAID' ? 'var(--success-bg)' : 'var(--warning-bg)',
                                                color: invoice.status === 'PAID' ? 'var(--success)' : '#B45309'
                                            }}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button className="btn-secondary btn-sm" title="Print Invoice">
                                                <Printer size={16} />
                                            </button>
                                            {invoice.status === 'PENDING' && (
                                                <button className="btn-primary btn-sm" style={{ width: 'auto' }}>
                                                    <span>Process Payment</span>
                                                    <ArrowUpRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem 1.5rem', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--info)', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid var(--primary)'
            }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px', fontWeight: 'bold' }}>!</div>
                <p>
                    <strong>Development Note:</strong> This module is being integrated with live clinical data. Real-time invoice synchronization will be active in the next thermal update.
                </p>
            </div>
        </div>
    );
};

export default BillingDashboard;

