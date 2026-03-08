import { useState, useEffect } from 'react';
import { ReceptionistService } from '../../services/receptionist.service';
import type { Appointment, DoctorInfoDTO, TriageUpdateRequest } from '../../services/api.types';
import { 
    Users, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    UserPlus, 
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState<Appointment[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<DoctorInfoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
    
    // Triage Form State
    const [triageDoctorId, setTriageDoctorId] = useState('');
    const [triageUrgency, setTriageUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL'>('ROUTINE');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [requests, today, doctorList] = await Promise.all([
                ReceptionistService.getRequestedAppointments(),
                ReceptionistService.getTodayAppointments(),
                ReceptionistService.getDoctors()
            ]);
            setPendingRequests(requests);
            setTodayAppointments(today);
            setDoctors(doctorList);
        } catch (error) {
            console.error("Failed to load receptionist data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await ReceptionistService.approveAppointment(id);
            await fetchData(); // Refresh
        } catch (error) {
            console.error("Failed to approve appointment", error);
            alert("Failed to approve appointment.");
        }
    };

    const handleCheckIn = async (id: string) => {
        try {
            await ReceptionistService.checkInPatient(id);
            await fetchData(); // Refresh
        } catch (error) {
            console.error("Failed to check-in patient", error);
            alert("Failed to check-in patient.");
        }
    };

    const handleOpenTriage = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setTriageDoctorId(apt.doctor?.id || '');
        setTriageUrgency(apt.urgencyLevel || 'ROUTINE');
        setIsTriageModalOpen(true);
    };

    const handleTriageSubmit = async () => {
        if (!selectedAppointment) return;
        if (!triageDoctorId) {
            alert("Please select a doctor.");
            return;
        }

        try {
            const update: TriageUpdateRequest = {
                doctorId: triageDoctorId,
                urgencyLevel: triageUrgency
            };
            await ReceptionistService.triageAppointment(selectedAppointment.id, update);
            setIsTriageModalOpen(false);
            await fetchData();
        } catch (error) {
            console.error("Failed to triage appointment", error);
            alert("Failed to update triage details.");
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt("Enter cancellation reason:");
        if (reason === null) return;
        try {
            await ReceptionistService.cancelAppointment(id, reason);
            await fetchData(); // Refresh
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            alert("Failed to cancel appointment.");
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return 'Slot Not Assigned';
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (time: string | null) => {
        if (!time) return 'TBD';
        return new Date(time).toLocaleDateString();
    };

    const filteredToday = todayAppointments.filter(apt => 
        apt.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Reception Desk</h2>
                    <p className="page-description">Manage patient arrivals and appointment requests</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => navigate('/register/patient')}>
                        <UserPlus size={18} /> New Patient
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/patient-portal/book-appointment')}>
                        <Calendar size={18} /> Book Walk-in
                    </button>
                </div>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue"><Users size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Today</span>
                        <span className="stat-value">{todayAppointments.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-orange"><Clock size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Approval</span>
                        <span className="stat-value">{pendingRequests.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Checked In</span>
                        <span className="stat-value">{todayAppointments.filter(a => a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS').length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-gray"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{todayAppointments.filter(a => a.status === 'COMPLETED').length}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                {/* Main Appointment List */}
                <div className="card">
                    <div className="panel-header">
                        <h3><Calendar size={18} /> Today's Schedule</h3>
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search patient or doctor..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Token</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                    ) : filteredToday.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No appointments for today.</td></tr>
                                    ) : (
                                        filteredToday.map(apt => (
                                            <tr key={apt.id}>
                                                <td>{formatTime(apt.appointmentTime)}</td>
                                                <td>
                                                    <div className="patient-name">{apt.patient.user.name}</div>
                                                    <div className="appointment-source">{apt.isWalkIn ? 'Walk-in' : 'Booked Online'}</div>
                                                </td>
                                                <td>{apt.doctor?.name || <span className="text-muted">Unassigned</span>}</td>
                                                <td><span className="token-badge">{apt.tokenNumber || '-'}</span></td>
                                                <td>
                                                    <span className={`status-badge-sm status-${apt.status.toLowerCase()}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED' ? (
                                                        <button className="btn-secondary btn-sm" onClick={() => handleCheckIn(apt.id)}>
                                                            Check In
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No action available</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pending Requests Side Panel */}
                <div className="card">
                    <div className="panel-header">
                        <h3><Clock size={18} /> Pending Requests</h3>
                    </div>
                    <div className="panel-body">
                        <div className="requests-container">
                            {pendingRequests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                                    <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                                    <p>All requests processed!</p>
                                </div>
                            ) : (
                                pendingRequests.map(req => (
                                    <div key={req.id} className="request-item">
                                        <div className="request-header">
                                            <div className="request-patient">
                                                <div className="patient-name">{req.patient.user.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {req.doctor ? (
                                                        <>wants to see <strong>{req.doctor.name}</strong></>
                                                    ) : (
                                                        <>Requires Triage & Assignment</>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatTime(req.appointmentTime || req.preferredDate)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {formatDate(req.appointmentTime || req.preferredDate)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="request-reason">
                                            <strong>Reason:</strong> {req.reasonForVisit || 'Not specified'}
                                        </div>
                                        <div className="request-actions">
                                            <button className="btn-primary btn-sm" onClick={() => handleOpenTriage(req)}>
                                                Triage & Assign
                                            </button>
                                            <button className="btn-reject btn-sm" onClick={() => handleCancel(req.id)}>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Triage Modal */}
            {isTriageModalOpen && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content triage-modal">
                        <div className="modal-header">
                            <h3>Triage Appointment</h3>
                            <button className="close-btn" onClick={() => setIsTriageModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>Patient:</strong> {selectedAppointment.patient.user.name} <br/>
                                <strong>Symptoms:</strong> {selectedAppointment.symptoms} <br/>
                                <strong>Description:</strong> {selectedAppointment.problemDescription}
                            </div>
                            
                            <div className="form-group">
                                <label>Assign Doctor</label>
                                <select 
                                    className="input-field" 
                                    value={triageDoctorId} 
                                    onChange={(e) => setTriageDoctorId(e.target.value)}
                                >
                                    <option value="">Select Doctor...</option>
                                    {doctors.map(dr => (
                                        <option key={dr.id} value={dr.id}>{dr.name} ({dr.specialization})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Urgency Level</label>
                                <div className="urgency-selector">
                                    {(['ROUTINE', 'URGENT', 'EMERGENCY', 'CRITICAL'] as const).map(level => (
                                        <button 
                                            key={level}
                                            className={`urgency-btn ${triageUrgency === level ? 'active' : ''} urgency-${level.toLowerCase()}`}
                                            onClick={() => setTriageUrgency(level)}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsTriageModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleTriageSubmit}>Confirm Appointment</button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        backdrop-filter: blur(4px);
                    }
                    .triage-modal {
                        width: 100%;
                        max-width: 500px;
                        background: white;
                        border-radius: var(--radius-lg);
                        box-shadow: var(--shadow-lg);
                    }
                    .modal-header {
                        padding: 1.5rem;
                        border-bottom: 1px solid var(--border-light);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .modal-body {
                        padding: 1.5rem;
                    }
                    .modal-footer {
                        padding: 1.5rem;
                        border-top: 1px solid var(--border-light);
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                    }
                    .patient-summary {
                        background: var(--bg-main);
                        padding: 1rem;
                        border-radius: var(--radius-md);
                        margin-bottom: 1.5rem;
                        font-size: 0.875rem;
                        line-height: 1.6;
                    }
                    .form-group {
                        margin-bottom: 1.5rem;
                    }
                    .form-group label {
                        display: block;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                    }
                    .urgency-selector {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                    }
                    .urgency-btn {
                        padding: 0.75rem;
                        border: 1px solid var(--border);
                        border-radius: var(--radius-md);
                        font-size: 0.75rem;
                        font-weight: 600;
                        background: white;
                        transition: all 0.2s;
                    }
                    .urgency-btn.active.urgency-routine { background: #FEF3C7; border-color: #F59E0B; color: #B45309; }
                    .urgency-btn.active.urgency-urgent { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
                    .urgency-btn.active.urgency-emergency { background: #fecaca; border-color: #dc2626; color: #991b1b; }
                    .urgency-btn.active.urgency-critical { background: #ed0e0e; border-color: #991b1b; color: white; }
                    
                    .bg-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                    .bg-orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .bg-green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    .bg-gray { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

                    .status-requested { background: #FEF3C7; color: #B45309; }
                    .status-confirmed { background: #DBEAFE; color: #1E40AF; }
                    .status-scheduled { background: #E0F2FE; color: #0369A1; }
                    .status-checked_in { background: #D1FAE5; color: #065F46; }
                    .status-in_progress { background: #ECFDF5; color: #047857; }
                    .status-completed { background: #F3F4F6; color: #374151; }
                    .status-cancelled { background: #FEE2E2; color: #991B1B; }
                    
                    .request-item {
                        transition: transform 0.2s, box-shadow 0.2s;
                        padding: 1rem;
                        border: 1px solid var(--border-light);
                        border-radius: var(--radius-md);
                        background: var(--bg-main);
                        animation: fadeIn 0.3s ease-out;
                    }
                    .request-item:hover {
                        transform: translateY(-2px);
                        box-shadow: var(--shadow-sm);
                    }
                    
                    .request-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 0.75rem;
                    }
                    .patient-name { font-weight: 600; color: var(--text-primary); }
                    .appointment-source { font-size: 0.75rem; color: var(--text-tertiary); }
                    .token-badge { font-weight: 700; color: var(--primary); }

                    .request-reason {
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                        margin-bottom: 1rem;
                        padding: 0.5rem;
                        background: white;
                        border-radius: 4px;
                        border-left: 3px solid var(--primary);
                    }
                    .request-actions {
                        display: flex;
                        gap: 0.5rem;
                    }
                    .btn-reject {
                        flex: 0.4;
                        background: #FEF2F2;
                        color: #991B1B;
                        border: 1px solid #FECACA;
                    }
                `}
            </style>
        </div>
    );
};

export default ReceptionistDashboard;
