import { useState, useEffect } from 'react';
import { NurseService } from '../../services/nurse.service';
import type { NurseDashboardStatsDTO, AppointmentResponse, TriageRequest } from '../../services/api.types';
import { Users, Activity, Clock, CheckCircle, Search } from 'lucide-react';

const NurseDashboard = () => {
    const [stats, setStats] = useState<NurseDashboardStatsDTO | null>(null);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Triage Modal State
    const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [triageData, setTriageData] = useState<TriageRequest>({
        vitalsSnapshot: '',
        initialNotes: '',
        markAsReady: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, appointmentsData] = await Promise.all([
                NurseService.getDashboardStats(),
                NurseService.getTodayAppointments()
            ]);
            setStats(statsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load nurse data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleOpenTriage = (appointment: AppointmentResponse) => {
        setSelectedAppointment(appointment);
        setTriageData({
            vitalsSnapshot: '',
            initialNotes: '',
            markAsReady: false
        });
        setIsTriageModalOpen(true);
    };

    const handleTriageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        setIsSubmitting(true);
        try {
            await NurseService.performTriage(selectedAppointment.id, triageData);
            setIsTriageModalOpen(false);
            fetchData(); // Refresh the list to reflect status changes
        } catch (error) {
            console.error("Failed to submit triage data", error);
            alert("Failed to save triage data. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Nurse Triage Station</h2>
                    <p className="page-description">Manage patient flow and record vital signs</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF9C3', color: '#CA8A04' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Waiting Room</p>
                        <h4 className="stat-value">{stats?.waitingRoomCount || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Today</p>
                        <h4 className="stat-value">{stats?.todayAppointments || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Triaged / Ready</p>
                        <h4 className="stat-value">{stats?.triagedToday || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Critical Alerts</p>
                        <h4 className="stat-value">{stats?.criticalCases || 0}</h4>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                {/* Patient Flow List */}
                <div className="card schedule-panel">
                    <div className="panel-header">
                        <h3>Patient Flow</h3>
                        <div className="search-bar-sm">
                            <Search size={14} className="search-icon" />
                            <input type="text" placeholder="Search patient..." className="search-input-sm" />
                        </div>
                    </div>

                    <div className="schedule-list">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading patient flow...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="empty-state">
                                <Users size={32} color="var(--text-tertiary)" />
                                <p>No scheduled patients today.</p>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <div key={apt.id} className={`appointment-item ${apt.status === 'IN_PROGRESS' ? 'item-active' : ''}`}>
                                    <div className="apt-time">
                                        <span>{formatTime(apt.appointmentTime)}</span>
                                    </div>
                                    <div className="apt-details">
                                        <div className="apt-patient-name">{apt.patientName}</div>
                                        <div className="apt-reason">Reason: {apt.reasonForVisit || 'General Consultation'}</div>
                                    </div>
                                    <div className="apt-status">
                                        <span className={`status-badge-sm status-${apt.status.toLowerCase()}`}>
                                            {apt.status === 'SCHEDULED' ? 'WAITING' : apt.status === 'IN_PROGRESS' ? 'READY FOR DOCTOR' : apt.status}
                                        </span>
                                    </div>
                                    <div className="apt-actions" style={{ minWidth: '130px' }}>
                                        {apt.status === 'SCHEDULED' && (
                                            <button
                                                className="btn-primary-sm"
                                                onClick={() => handleOpenTriage(apt)}
                                            >
                                                <Activity size={14} /> Triage
                                            </button>
                                        )}
                                        {apt.status === 'IN_PROGRESS' && (
                                            <button className="btn-outline-sm" onClick={() => handleOpenTriage(apt)}>
                                                Update Vitals
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Triage Modal */}
            {isTriageModalOpen && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content triage-modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Conduct Triage</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Patient: <strong>{selectedAppointment.patientName}</strong>
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleTriageSubmit}>
                            <div className="modal-body">
                                <div className="form-section">
                                    <label className="section-title">Vital Signs</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="BP: 120/80 mmHg, Temp: 98.6F, Weight: 70kg..."
                                        value={triageData.vitalsSnapshot}
                                        onChange={e => setTriageData({ ...triageData, vitalsSnapshot: e.target.value })}
                                    />
                                </div>

                                <div className="form-section">
                                    <label className="section-title">Presenting Complaint Notes</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="Briefly describe the patient's current symptoms..."
                                        value={triageData.initialNotes}
                                        onChange={e => setTriageData({ ...triageData, initialNotes: e.target.value })}
                                    />
                                </div>

                                <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        id="ready-checkbox"
                                        checked={triageData.markAsReady}
                                        onChange={e => setTriageData({ ...triageData, markAsReady: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="ready-checkbox" style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)' }}>
                                        Mark patient as Ready for Doctor
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={() => setIsTriageModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Triage Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>
                {`
                    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
                    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
                    .page-title { font-size: 1.5rem; margin-bottom: 0.25rem; font-weight: 600; color: var(--text-primary); }
                    .page-description { color: var(--text-secondary); font-size: 0.875rem; }
                    
                    .card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
                    
                    /* Stats Grid */
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
                    .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; }
                    .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                    .stat-content { display: flex; flex-direction: column; }
                    .stat-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
                    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; }

                    .dashboard-content-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
                    
                    /* Schedule Panel */
                    .schedule-panel { display: flex; flex-direction: column; }
                    .panel-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
                    .panel-header h3 { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-primary); }
                    
                    .search-bar-sm { position: relative; width: 220px; }
                    .search-input-sm { width: 100%; padding: 0.4rem 1rem 0.4rem 2rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.875rem; }
                    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); }

                    .schedule-list { display: flex; flex-direction: column; }
                    .appointment-item { display: flex; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-light); gap: 1rem; transition: background-color 0.2s; }
                    .appointment-item:hover { background-color: var(--bg-main); }
                    .appointment-item.item-active { background-color: #F8FAFC; border-left: 3px solid var(--primary); }
                    .appointment-item:last-child { border-bottom: none; }
                    
                    .apt-time { min-width: 80px; font-weight: 600; color: var(--text-primary); font-size: 0.875rem; border-right: 2px solid var(--border-light); padding-right: 1rem; }
                    .apt-details { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
                    .apt-patient-name { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
                    .apt-reason { font-size: 0.875rem; color: var(--text-secondary); }
                    
                    .apt-status { min-width: 120px; }
                    .status-badge-sm { padding: 0.25rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
                    .status-scheduled { background-color: #FEF9C3; color: #CA8A04; border: 1px solid #FEF08A; }
                    .status-in_progress { background-color: #DBEAFE; color: #2563EB; border: 1px solid #BFDBFE; }
                    .status-completed { background-color: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0; }
                    .status-cancelled { background-color: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; }
                    
                    .btn-primary-sm { padding: 0.4rem 0.75rem; background-color: var(--primary); color: white; border: none; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 0.5rem; width: 100%; justify-content: center; }
                    .btn-primary-sm:hover { background-color: var(--primary-dark); }
                    
                    .btn-outline-sm { padding: 0.4rem 0.75rem; border: 1px solid var(--primary); color: var(--primary); border-radius: var(--radius-md); background: transparent; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; width: 100%; text-align: center; }
                    .btn-outline-sm:hover { background: var(--bg-main); }
                    
                    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--text-tertiary); gap: 1rem; }
                    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--text-secondary); gap: 1rem; }
                    .spinner { width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }

                    /* Modal Styles */
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                    .modal-content { background-color: white; border-radius: var(--radius-lg); width: 100%; display: flex; flex-direction: column; box-shadow: var(--shadow-xl); }
                    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: flex-start; }
                    .modal-header h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: var(--text-primary); }
                    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                    .form-section { display: flex; flex-direction: column; gap: 0.5rem; }
                    .section-title { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
                    .input-field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #9CA3AF; border-radius: var(--radius-md); font-family: inherit; transition: all var(--transition-fast); background-color: var(--bg-surface); resize: vertical; }
                    .input-field:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
                    .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 1rem; background-color: #FAFCFF; border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg); }
                `}
            </style>
        </div>
    );
};

export default NurseDashboard;
