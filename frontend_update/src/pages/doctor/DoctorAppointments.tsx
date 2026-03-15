import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, User, Search, ChevronRight, 
    MoreVertical, CheckCircle, AlertCircle, Play,
    Filter, RefreshCw, ClipboardList
} from 'lucide-react';
import { DoctorService } from '../../services/doctor.service';
import type { AppointmentResponse } from '../../services/api.types';
import '../../styles/patient-theme.css';

const DoctorAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await DoctorService.getTodayAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartVisit = (apt: AppointmentResponse) => {
        navigate(`/doctor/patient/${apt.patientId}/emr?appointmentId=${apt.id}`);
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (apt.tokenNumber?.toString().includes(searchTerm));
        const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const waitingQueue = appointments.filter(apt => apt.status === 'CHECKED_IN' || apt.status === 'IN_PROGRESS');
    const scheduledApts = appointments.filter(apt => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED');

    const formatTime = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'CHECKED_IN': return 'status-checked-in';
            case 'IN_PROGRESS': return 'status-in-progress';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-scheduled';
        }
    };

    return (
        <div className="patient-theme" style={{ padding: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Daily Appointments</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your patient queue and consultation schedule for today.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '12px' }}>
                        <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                {/* Main Content: Full Schedule */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ClipboardList size={22} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>All Appointments</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search patient..." 
                                    className="form-control"
                                    style={{ paddingLeft: '2.5rem', width: '250px', borderRadius: '10px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="form-control" 
                                style={{ width: '150px', borderRadius: '10px' }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="CHECKED_IN">Checked In</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ minHeight: '400px' }}>
                        {isLoading ? (
                            <div style={{ padding: '4rem', textAlign: 'center' }}>
                                <RefreshCw size={32} className="spin" color="var(--primary)" />
                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading schedule...</p>
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center' }}>
                                <AlertCircle size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                                <h3>No appointments found</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>No entries match your current search or filters.</p>
                            </div>
                        ) : (
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time / Token</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map(apt => (
                                        <tr key={apt.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatTime(apt.appointmentTime)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Token #{apt.tokenNumber || 'N/A'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justify_content: 'center', color: 'var(--primary-dark)' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div style={{ fontWeight: 500 }}>{apt.patientName}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {apt.reasonForVisit || 'General Consultation'}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span className={`badge ${getStatusClass(apt.status)}`} style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {apt.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {(apt.status === 'CHECKED_IN' || apt.status === 'IN_PROGRESS' || apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') ? (
                                                    <button 
                                                        className="btn-primary" 
                                                        onClick={() => handleStartVisit(apt)}
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Play size={14} fill="currentColor" />
                                                        {apt.status === 'IN_PROGRESS' ? 'Resume' : 'Start Visit'}
                                                    </button>
                                                ) : (
                                                    <button className="btn-outline" disabled style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px', opacity: 0.5 }}>
                                                        View EMR
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar: Waiting Queue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--primary-dark)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Clock size={20} />
                            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Waiting Queue</h3>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{waitingQueue.length}</div>
                        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Patients ready for consultation</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={16} /> Up Next
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {waitingQueue.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '1rem' }}>Queue is empty</p>
                            ) : (
                                waitingQueue.slice(0, 3).map(apt => (
                                    <div key={apt.id} style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{apt.patientName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Token #{apt.tokenNumber}</span>
                                            <span>{formatTime(apt.appointmentTime)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .status-checked-in { background: #E0F2FE; color: #0369A1; }
                    .status-in-progress { background: #FEF3C7; color: #B45309; }
                    .status-completed { background: #D1FAE5; color: #065F46; }
                    .status-scheduled { background: #F3F4F6; color: #4B5563; }
                    .status-cancelled { background: #FEE2E2; color: #991B1B; }

                    .spin { animation: spin 2s linear infinite; }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .data-table tr:hover { background-color: #F9FAFB; }
                `}
            </style>
        </div>
    );
};

export default DoctorAppointments;
