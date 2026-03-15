import { useState, useEffect, useMemo } from 'react';
import { ReceptionistService } from '../../services/receptionist.service';
import type { Appointment, DoctorInfoDTO, TriageUpdateRequest, AmbulanceResponse } from '../../services/api.types';
import { 
    Users, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    UserPlus, 
    Search,
    AlertTriangle,
    Navigation,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState<Appointment[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<DoctorInfoDTO[]>([]);
    const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
    
    // Triage Form State
    const [triageDoctorId, setTriageDoctorId] = useState('');
    const [triageUrgency, setTriageUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL'>('ROUTINE');
    const [triageTime, setTriageTime] = useState('');

    // Cancellation Modal State
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchAmbulanceOnly, 15000); // Poll for emergencies
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [requests, today, doctorList, ambulance] = await Promise.all([
                ReceptionistService.getRequestedAppointments(),
                ReceptionistService.getTodayAppointments(),
                ReceptionistService.getDoctors(),
                ReceptionistService.getAmbulanceRequests()
            ]);
            setPendingRequests(requests);
            setTodayAppointments(today);
            setDoctors(doctorList);
            setAmbulanceRequests(ambulance);
        } catch (error) {
            console.error("Failed to load receptionist data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAmbulanceOnly = async () => {
        try {
            const ambulance = await ReceptionistService.getAmbulanceRequests();
            setAmbulanceRequests(ambulance);
        } catch (err) {}
    };

    const handleApprove = async (id: string) => {
        try {
            await ReceptionistService.approveAppointment(id);
            await fetchData();
        } catch (error) {
            alert("Failed to approve appointment.");
        }
    };

    const handleCheckIn = async (id: string) => {
        try {
            await ReceptionistService.checkInPatient(id);
            await fetchData();
        } catch (error) {
            alert("Failed to check-in patient.");
        }
    };

    const handleDispatchAmbulance = async (id: string) => {
        try {
            await ReceptionistService.dispatchAmbulance(id);
            await fetchAmbulanceOnly();
        } catch (err) {
            alert("Failed to dispatch ambulance.");
        }
    };

    const handleCompleteAmbulance = async (id: string) => {
        try {
            await ReceptionistService.completeAmbulance(id);
            await fetchAmbulanceOnly();
        } catch (err) {
            alert("Failed to mark ambulance as completed.");
        }
    };

    const handleOpenTriage = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setTriageDoctorId(apt.doctor?.id || '');
        setTriageUrgency(apt.urgencyLevel || 'ROUTINE');
        // Pre-fill with today's date + current time or preferred date
        const baseDate = apt.preferredDate ? new Date(apt.preferredDate) : new Date();
        const year = baseDate.getFullYear();
        const month = String(baseDate.getMonth() + 1).padStart(2, '0');
        const day = String(baseDate.getDate()).padStart(2, '0');
        const hours = String(new Date().getHours()).padStart(2, '0');
        const minutes = String(new Date().getMinutes()).padStart(2, '0');
        setTriageTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        setIsTriageModalOpen(true);
    };

    const handleTriageSubmit = async () => {
        if (!selectedAppointment || !triageDoctorId) {
            alert("Please select a doctor.");
            return;
        }
        try {
            const update: TriageUpdateRequest = {
                doctorId: triageDoctorId,
                urgencyLevel: triageUrgency,
                appointmentTime: triageTime ? new Date(triageTime).toISOString() : undefined
            };
            await ReceptionistService.triageAppointment(selectedAppointment.id, update);
            setIsTriageModalOpen(false);
            await fetchData();
        } catch (error) {
            alert("Failed to update triage details. Please ensure the time slot is available.");
        }
    };

    const handleCancelClick = (id: string) => {
        setCancellingAppointmentId(id);
        setCancellationReason('');
        setIsCancellationModalOpen(true);
    };

    const handleCancellationSubmit = async () => {
        if (!cancellingAppointmentId || !cancellationReason.trim()) {
            alert("Please enter a cancellation reason.");
            return;
        }
        try {
            await ReceptionistService.cancelAppointment(cancellingAppointmentId, cancellationReason);
            setIsCancellationModalOpen(false);
            setCancellingAppointmentId(null);
            await fetchData();
        } catch (error) {
            alert("Failed to cancel appointment.");
        }
    };

    const formatTime = (time: string | null, isRequested: boolean = false) => {
        if (!time) return 'Slot Not Assigned';
        const date = new Date(time);
        // If it's 12:00 AM (00:00) and it's a requested appointment, show TBD
        if (isRequested && date.getHours() === 0 && date.getMinutes() === 0) {
            return 'Time TBD';
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredToday = useMemo(() => todayAppointments.filter(apt => 
        (apt.patient.firstName + ' ' + apt.patient.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [todayAppointments, searchTerm]);

    const activeAmbulanceRequests = ambulanceRequests.filter(req => req.status !== 'COMPLETED' && req.status !== 'CANCELLED');

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            {/* Real-time Emergency Alerts */}
            {activeAmbulanceRequests.length > 0 && (
                <div className="emergency-alert-banner" style={{ 
                    background: '#FEF2F2', 
                    border: '2px solid #EF4444', 
                    borderRadius: '1rem', 
                    padding: '1.5rem', 
                    marginBottom: '2.5rem',
                    animation: 'pulse-red 2s infinite ease-in-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#EF4444', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h2 style={{ color: '#991B1B', fontWeight: 800, fontSize: '1.25rem' }}>ACTIVE EMERGENCY REQUESTS ({activeAmbulanceRequests.length})</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {activeAmbulanceRequests.map(req => (
                            <div key={req.id} style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #FEE2E2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{req.patientName}</span>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: 800, 
                                        padding: '0.2rem 0.5rem', 
                                        borderRadius: '4px', 
                                        background: req.status === 'PENDING' ? '#FEE2E2' : '#DBEAFE',
                                        color: req.status === 'PENDING' ? '#991B1B' : '#1E40AF'
                                    }}>{req.status}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <MapPin size={14} /> <span style={{ flex: 1 }}>{req.address}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    <Phone size={14} /> {req.phoneNumber}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {req.status === 'PENDING' ? (
                                        <button onClick={() => handleDispatchAmbulance(req.id)} className="btn-dispatch" style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Navigation size={16} /> DISPATCH
                                        </button>
                                    ) : (
                                        <button onClick={() => handleCompleteAmbulance(req.id)} style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                                            ARRIVED / COMPLETE
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="page-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1E293B' }}>Reception Desk</h2>
                    <p className="page-description" style={{ color: '#64748B' }}>Real-time triage and appointment management</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => navigate('/register/patient')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        <UserPlus size={18} /> New Patient
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/patient-portal/book-appointment')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: '#8BAD89', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        <Calendar size={18} /> Book Walk-in
                    </button>
                </div>
            </div>

            <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard icon={Users} label="Daily Total" value={todayAppointments.length} color="#3B82F6" />
                <StatCard icon={Clock} label="Pending Triage" value={pendingRequests.length} color="#F59E0B" />
                <StatCard icon={CheckCircle} label="Checked In" value={todayAppointments.filter(a => a.status === 'CHECKED_IN').length} color="#10B981" />
                <StatCard icon={AlertCircle} label="Emergencies" value={activeAmbulanceRequests.length} color="#EF4444" />
            </div>

            <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
                {/* Main Appointment List */}
                <div className="card" style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div className="panel-header" style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <Calendar size={18} color="#8BAD89" /> Today's Schedule
                        </h3>
                        <div className="search-bar" style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search patient..." 
                                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.9rem', width: '250px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="table-container">
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', background: '#F8FAFC' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>TIME</th>
                                        <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>PATIENT</th>
                                        <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DOCTOR</th>
                                        <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>STATUS</th>
                                        <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading appointments...</td></tr>
                                    ) : filteredToday.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No appointments found.</td></tr>
                                    ) : (
                                        filteredToday.map(apt => (
                                            <tr key={apt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{formatTime(apt.appointmentTime)}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{`${apt.patient.firstName} ${apt.patient.lastName}`}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{apt.isWalkIn ? 'Walk-in' : 'Booked'}</div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{apt.doctor?.name || <span style={{ color: '#F59E0B', fontWeight: 600 }}>Pending Assignment</span>}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 700, 
                                                        padding: '0.25rem 0.6rem', 
                                                        borderRadius: '99px',
                                                        background: apt.status === 'CHECKED_IN' ? '#D1FAE5' : '#DBEAFE',
                                                        color: apt.status === 'CHECKED_IN' ? '#065F46' : '#1E40AF'
                                                    }}>{apt.status}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED' ? (
                                                        <button onClick={() => handleCheckIn(apt.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: '#F1F5F9', border: '1px solid #E2E8F0', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            Check In
                                                        </button>
                                                    ) : '-'}
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
                <div className="card" style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} color="#F59E0B" /> Requests
                        </h3>
                        <span style={{ padding: '0.2rem 0.6rem', background: '#F59E0B15', color: '#F59E0B', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{pendingRequests.length} PENDING</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                                <p>All clear!</p>
                            </div>
                        ) : (
                            pendingRequests.map(req => (
                                <div key={req.id} style={{ border: '1px solid #F1F5F9', borderRadius: '1rem', padding: '1rem', background: '#F8FAFC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div style={{ fontWeight: 700 }}>{`${req.patient.firstName} ${req.patient.lastName}`}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{formatTime(req.appointmentTime || req.preferredDate, true)}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem', background: 'white', padding: '0.5rem', borderRadius: '0.5rem', borderLeft: '3px solid #8BAD89' }}>
                                        {req.symptoms || req.reasonForVisit || 'General Consultation'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleOpenTriage(req)} style={{ flex: 1, padding: '0.5rem', background: '#8BAD89', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                                            Triage & Assign
                                        </button>
                                        <button onClick={() => handleCancelClick(req.id)} style={{ padding: '0.5rem', background: 'white', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Triage Modal */}
            {isTriageModalOpen && selectedAppointment && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="modal-content" style={{ background: 'white', borderRadius: '2rem', padding: '2.5rem', width: '600px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>Triage & Assignment</h3>
                            <button onClick={() => setIsTriageModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#64748B' }}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '1.25rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Patient</label>
                                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{`${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Dept Preference</label>
                                    <div style={{ fontWeight: 700, color: '#8BAD89' }}>{selectedAppointment.departmentPreference || 'Not Specified'}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Reported Symptoms</label>
                                <div style={{ color: '#475569', lineHeight: 1.5 }}>{selectedAppointment.symptoms || 'No symptoms provided'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1E293B' }}>Assign Specialist</label>
                                <select 
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', background: '#FFFFFF', outline: 'none' }}
                                    value={triageDoctorId}
                                    onChange={e => setTriageDoctorId(e.target.value)}
                                >
                                    <option value="">Select Doctor...</option>
                                    {doctors.map(dr => (
                                        <option key={dr.id} value={dr.id}>{dr.name} - {dr.specialization}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1E293B' }}>Appointment Time</label>
                                <input 
                                    type="datetime-local"
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontFamily: 'Inter', fontSize: '0.95rem', outline: 'none' }}
                                    value={triageTime}
                                    onChange={e => setTriageTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1E293B' }}>Urgency Level</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                {(['ROUTINE', 'URGENT', 'EMERGENCY', 'CRITICAL'] as const).map(level => {
                                    const levelColors: any = {
                                        ROUTINE: { border: '#8BAD89', bg: '#8BAD8910', text: '#3E5C3C' },
                                        URGENT: { border: '#F59E0B', bg: '#F59E0B10', text: '#92400E' },
                                        EMERGENCY: { border: '#EF4444', bg: '#EF444410', text: '#991B1B' },
                                        CRITICAL: { border: '#7C3AED', bg: '#7C3AED10', text: '#5B21B6' }
                                    };
                                    const conf = levelColors[level];
                                    const isActive = triageUrgency === level;
                                    return (
                                        <button 
                                            key={level}
                                            onClick={() => setTriageUrgency(level)}
                                            style={{ 
                                                padding: '1rem 0.5rem', 
                                                borderRadius: '1rem', 
                                                border: `2px solid ${isActive ? conf.border : '#F1F5F9'}`,
                                                background: isActive ? conf.bg : 'white',
                                                color: isActive ? conf.text : '#64748B',
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: isActive ? `0 4px 12px ${conf.border}20` : 'none'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleTriageSubmit} style={{ flex: 1, padding: '1.25rem', borderRadius: '1rem', border: 'none', background: '#8BAD89', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px -5px rgba(139, 173, 137, 0.4)' }}>
                                Confirm & Assign Specialist
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Modal */}
            {isCancellationModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
                    <div className="modal-content" style={{ background: 'white', borderRadius: '2rem', padding: '2.5rem', width: '450px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: '#FEE2E2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <XCircle size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Cancel Appointment?</h3>
                            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>This action cannot be undone. Please provide a reason for the patient.</p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1E293B' }}>Cancellation Reason</label>
                            <textarea 
                                placeholder="e.g. Doctor unavailable, patient requested change..."
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', height: '120px', resize: 'none', outline: 'none', fontFamily: 'Inter' }}
                                value={cancellationReason}
                                onChange={e => setCancellationReason(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setIsCancellationModalOpen(false)} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0', background: 'white', fontWeight: 700, color: '#64748B', cursor: 'pointer' }}>Go Back</button>
                            <button onClick={handleCancellationSubmit} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel Visit</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-red { 0%, 100% { border-color: #EF4444; } 50% { border-color: #F87171; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); } }
                .btn-dispatch:hover { transform: scale(1.02); filter: brightness(1.1); transition: all 0.2s; }
            `}</style>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ background: `${color}15`, color: color, padding: '0.75rem', borderRadius: '12px' }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>{value}</p>
        </div>
    </div>
);

export default ReceptionistDashboard;
