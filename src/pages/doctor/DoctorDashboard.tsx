import { useState, useEffect } from 'react';
import { DoctorService } from '../../services/doctor.service';
import type { DoctorDashboardStatsDTO, AppointmentResponse } from '../../services/api.types';
import { Users, Calendar, Clock, Activity, Search, X, Plus } from 'lucide-react';

const DoctorDashboard = () => {
    const [stats, setStats] = useState<DoctorDashboardStatsDTO | null>(null);
    const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Prescription Modal State
    const [activeAppointment, setActiveAppointment] = useState<AppointmentResponse | null>(null);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [prescriptionItems, setPrescriptionItems] = useState<{ medicineId: string, name: string, qty: number, instructions: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const data = await DoctorService.getMedicines();
            setMedicines(data);
        } catch (error) {
            console.error("Failed to load medicines catalog", error);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [statsData, appointmentsData] = await Promise.all([
                DoctorService.getDashboardStats(),
                DoctorService.getAppointments(new Date().toISOString().split('T')[0]) // Today's date
            ]);
            setStats(statsData);
            setTodayAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'status-upcoming';
            case 'IN_PROGRESS': return 'status-active';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const handleStartVisit = (appointment: AppointmentResponse) => {
        setActiveAppointment(appointment);
    };

    const handleAddMedicine = (med: any) => {
        if (!prescriptionItems.find(item => item.medicineId === med.id)) {
            setPrescriptionItems([...prescriptionItems, { medicineId: med.id, name: med.name, qty: 1, instructions: '1x a day' }]);
        }
        setSearchTerm('');
    };

    const handleRemoveMedicine = (id: string) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.medicineId !== id));
    };

    const handleSubmitPrescription = async () => {
        if (!activeAppointment || prescriptionItems.length === 0) return;
        setIsSubmitting(true);
        try {
            await DoctorService.createPrescription({
                patientId: activeAppointment.patientId,
                appointmentId: activeAppointment.id,
                items: prescriptionItems.map(item => ({
                    medicineId: item.medicineId,
                    prescribedQuantity: item.qty,
                    dosageInstructions: item.instructions
                }))
            });
            // Update appointment status to COMPLETED
            await DoctorService.updateAppointment(activeAppointment.id, { status: 'COMPLETED' });

            // Cleanup and refresh
            setActiveAppointment(null);
            setPrescriptionItems([]);
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to submit prescription", error);
            alert("Failed to create prescription.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Welcome, Doctor</h2>
                    <p className="page-description">Here's an overview of your day</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }}>
                    <Calendar size={18} />
                    View Full Schedule
                </button>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Patients</p>
                        <h4 className="stat-value">{stats?.totalPatients || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Today's Appointments</p>
                        <h4 className="stat-value">{stats?.todayAppointments || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF9C3', color: '#CA8A04' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Upcoming</p>
                        <h4 className="stat-value">{stats?.upcomingAppointments || 0}</h4>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Pending Prescriptions</p>
                        <h4 className="stat-value">{stats?.pendingPrescriptions || 0}</h4>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                {/* Today's Schedule List */}
                <div className="card schedule-panel">
                    <div className="panel-header">
                        <h3>Today's Schedule</h3>
                        <div className="search-bar-sm">
                            <Search size={14} className="search-icon" />
                            <input type="text" placeholder="Search patient..." className="search-input-sm" />
                        </div>
                    </div>

                    <div className="schedule-list">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading schedule...</p>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={32} color="var(--text-tertiary)" />
                                <p>No appointments today.</p>
                            </div>
                        ) : (
                            todayAppointments.map((apt) => (
                                <div key={apt.id} className="appointment-item">
                                    <div className="apt-time">
                                        <span>{formatTime(apt.appointmentTime)}</span>
                                    </div>
                                    <div className="apt-details">
                                        <div className="apt-patient-name">{apt.patientName}</div>
                                        <div className="apt-reason">{apt.reasonForVisit || 'General Follow-up'}</div>
                                    </div>
                                    <div className="apt-status">
                                        <span className={`status-badge-sm ${getStatusBadgeClass(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="apt-actions">
                                        {apt.status === 'COMPLETED' ? (
                                            <span className="text-success text-sm font-semibold">Done</span>
                                        ) : (
                                            <button className="btn-outline-sm" onClick={() => handleStartVisit(apt)}>Start Visit</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription Modal */}
            {activeAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>Clinical Visit: {activeAppointment.patientName}</h2>
                            <button className="close-btn" onClick={() => { setActiveAppointment(null); setPrescriptionItems([]); }}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                            {/* Left Pane: Medicine Search */}
                            <div>
                                <h3>Prescribe Medication</h3>
                                <div className="search-bar" style={{ marginTop: '1rem' }}>
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search Pharmacy Catalog..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="search-results">
                                        {filteredMedicines.slice(0, 5).map(med => (
                                            <div key={med.id} className="search-result-item" onClick={() => handleAddMedicine(med)}>
                                                <div>
                                                    <strong>{med.name}</strong> <span style={{ fontSize: '0.8rem', color: 'gray' }}>{med.unit}</span>
                                                    <div style={{ fontSize: '0.8rem' }}>{med.category} • {med.currentStock} in stock</div>
                                                </div>
                                                <button className="btn-icon"><Plus size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: Selected Items */}
                            <div>
                                <h3>Current Prescription</h3>
                                {prescriptionItems.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '2rem' }}>
                                        <p>No medicines selected</p>
                                    </div>
                                ) : (
                                    <div className="prescription-list">
                                        {prescriptionItems.map((item, index) => (
                                            <div key={item.medicineId} className="prescription-item">
                                                <div className="item-header">
                                                    <strong>{item.name}</strong>
                                                    <button className="text-danger" onClick={() => handleRemoveMedicine(item.medicineId)}><X size={16} /></button>
                                                </div>
                                                <div className="item-controls" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                    <div className="form-group" style={{ flex: '1' }}>
                                                        <label>Qty</label>
                                                        <input type="number" min="1" className="form-control" value={item.qty} onChange={(e) => {
                                                            const newItems = [...prescriptionItems];
                                                            newItems[index].qty = parseInt(e.target.value) || 1;
                                                            setPrescriptionItems(newItems);
                                                        }} />
                                                    </div>
                                                    <div className="form-group" style={{ flex: '2' }}>
                                                        <label>Instructions</label>
                                                        <input type="text" className="form-control" value={item.instructions} onChange={(e) => {
                                                            const newItems = [...prescriptionItems];
                                                            newItems[index].instructions = e.target.value;
                                                            setPrescriptionItems(newItems);
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => { setActiveAppointment(null); setPrescriptionItems([]); }}>Cancel</button>
                            <button
                                className="btn-primary"
                                disabled={prescriptionItems.length === 0 || isSubmitting}
                                onClick={handleSubmitPrescription}
                            >
                                {isSubmitting ? 'Submitting...' : 'Send to Pharmacy & Complete Visit'}
                            </button>
                        </div>
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
                    .appointment-item:last-child { border-bottom: none; }
                    
                    .apt-time { min-width: 80px; font-weight: 600; color: var(--primary); font-size: 0.875rem; border-right: 2px solid var(--primary-light); padding-right: 1rem; }
                    .apt-details { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
                    .apt-patient-name { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
                    .apt-reason { font-size: 0.875rem; color: var(--text-secondary); }
                    
                    .apt-status { min-width: 100px; }
                    .status-badge-sm { padding: 0.25rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
                    .status-upcoming { background-color: #FEF9C3; color: #CA8A04; border: 1px solid #FEF08A; }
                    .status-active { background-color: #DBEAFE; color: #2563EB; border: 1px solid #BFDBFE; }
                    .status-completed { background-color: #DCFCE7; color: #16A34A; border: 1px solid #BBF7D0; }
                    .status-cancelled { background-color: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; }
                    
                    .apt-actions { min-width: 100px; display: flex; justify-content: flex-end; }
                    .btn-outline-sm { padding: 0.4rem 0.75rem; border: 1px solid var(--primary); color: var(--primary); border-radius: var(--radius-md); background: transparent; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                    .btn-outline-sm:hover { background: var(--primary); color: white; }
                    
                    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--text-tertiary); gap: 1rem; }
                    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--text-secondary); gap: 1rem; }
                    .spinner { width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }

                    /* Modal Styles */
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                    .modal-content { background: white; border-radius: var(--radius-lg); width: 90%; max-width: 500px; display: flex; flex-direction: column; max-height: 90vh; }
                    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
                    .modal-header h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
                    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); transition: background-color 0.2s; }
                    .close-btn:hover { background-color: var(--bg-hover); color: var(--text-primary); }
                    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
                    .modal-footer { padding: 1.5rem; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 1rem; }
                    
                    /* Form elements */
                    .form-group { margin-bottom: 1.25rem; }
                    .form-group label { display: block; font-weight: 500; font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.5rem; }
                    .form-control { width: 100%; padding: 0.625rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.9375rem; color: var(--text-primary); transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }
                    .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    
                    /* Search Dropdown */
                    .search-bar { position: relative; }
                    .search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); }
                    .search-results { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: white; border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 10; max-height: 250px; overflow-y: auto; }
                    .search-result-item { padding: 0.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                    .search-result-item:hover { background-color: var(--bg-main); }
                    .search-result-item:last-child { border-bottom: none; }
                    .btn-icon { background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.25rem; display: flex; align-items: center;}
                    .btn-icon:hover { background: #DBEAFE; color: #2563EB; border-color: #BFDBFE; }
                    
                    /* Prescriptions List */
                    .prescription-list { display: flex; flex-direction: column; gap: 1rem; }
                    .prescription-item { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; background-color: var(--bg-main); }
                    .item-header { display: flex; justify-content: space-between; align-items: center; }
                    .text-danger { background: none; border: none; color: var(--danger); cursor: pointer; }
                    .text-success { color: var(--success); }
                    
                    .btn-secondary { padding: 0.625rem 1.25rem; background-color: white; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-weight: 500; cursor: pointer; transition: all 0.2s; }
                    .btn-secondary:hover { background-color: var(--bg-hover); }
                    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
                `}
            </style>
        </div>
    );
};

export default DoctorDashboard;
