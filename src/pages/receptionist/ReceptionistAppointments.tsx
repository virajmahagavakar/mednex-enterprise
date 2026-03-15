import { useState, useEffect, useMemo } from 'react';
import { ReceptionistService } from '../../services/receptionist.service';
import type { Appointment, DoctorInfoDTO, TriageUpdateRequest } from '../../services/api.types';
import { 
    Calendar, 
    Clock, 
    Search,
    Filter,
    XCircle,
    ChevronLeft,
    CheckCircle2,
    Clock3,
    AlertCircle,
    User,
    Stethoscope,
    FileText,
    MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceptionistAppointments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'requests'>('today');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<DoctorInfoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Modals state
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

    // Triage Form State
    const [triageDoctorId, setTriageDoctorId] = useState('');
    const [triageUrgency, setTriageUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'CRITICAL'>('ROUTINE');
    const [triageTime, setTriageTime] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let data: Appointment[] = [];
            if (activeTab === 'today') {
                data = await ReceptionistService.getTodayAppointments();
            } else if (activeTab === 'pending') {
                data = await ReceptionistService.getPendingAppointments();
            } else {
                data = await ReceptionistService.getRequestedAppointments();
            }
            
            const doctorList = await ReceptionistService.getDoctors();
            setAppointments(data);
            setDoctors(doctorList);
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setIsLoading(false);
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

    const handleOpenTriage = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setTriageDoctorId(apt.doctor?.id || '');
        setTriageUrgency(apt.urgencyLevel || 'ROUTINE');
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
            alert("Failed to update triage. Please check availability.");
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
            await fetchData();
        } catch (error) {
            alert("Failed to cancel appointment.");
        }
    };

    const formatTime = (time: string | null, isRequested: boolean = false) => {
        if (!time) return 'Slot Not Assigned';
        const date = new Date(time);
        if (isRequested && date.getHours() === 0 && date.getMinutes() === 0) {
            return 'Time TBD';
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch = (apt.patient.firstName + ' ' + apt.patient.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (apt.doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointments, searchTerm, statusFilter]);

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/receptionist/dashboard')} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} />
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Appointment Management</h2>
            </div>

            <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', background: '#F8FAFC', padding: '0.4rem', borderRadius: '1rem', gap: '0.5rem' }}>
                    <TabButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} icon={Calendar} label="Today" count={activeTab === 'today' ? filteredAppointments.length : undefined} />
                    <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} icon={Clock3} label="Pending" />
                    <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={AlertCircle} label="New Requests" />
                </div>

                <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by patient or doctor..." 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <select 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', appearance: 'none', outline: 'none', background: 'white' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="REQUESTED">Requested</option>
                            <option value="TRIAGED">Triaged</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>PATIENT INFO</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>APPOINTMENT TIME</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>ASSIGNED DOCTOR</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>URGENCY</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>STATUS</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
                                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #8BAD89', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                                Fetching records...
                            </td></tr>
                        ) : filteredAppointments.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No appointments match your criteria.</p>
                            </td></tr>
                        ) : (
                            filteredAppointments.map(apt => (
                                <tr key={apt.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="table-row">
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1E293B' }}>{`${apt.patient.firstName} ${apt.patient.lastName}`}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{apt.id.substring(0, 8).toUpperCase()} • {apt.isWalkIn ? 'Walk-in' : 'Booked'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                            <Clock size={16} color="#94A3B8" />
                                            {formatTime(apt.appointmentTime || apt.preferredDate, apt.status === 'REQUESTED')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        {apt.doctor ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                                                <Stethoscope size={16} color="#8BAD89" />
                                                <span style={{ fontWeight: 600 }}>{apt.doctor.name}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem', background: '#FFF7ED', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>Not Assigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <UrgencyBadge urgency={apt.urgencyLevel} />
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <StatusBadge status={apt.status} />
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {apt.status === 'REQUESTED' || apt.status === 'TRIAGED' ? (
                                                <button onClick={() => handleOpenTriage(apt)} className="action-btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', background: '#8BAD89', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    Triage
                                                </button>
                                            ) : (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED') ? (
                                                <button onClick={() => handleCheckIn(apt.id)} className="action-btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', background: '#F1F5F9', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: '#475569' }}>
                                                    Check In
                                                </button>
                                            ) : null}
                                            <button onClick={() => handleCancelClick(apt.id)} style={{ padding: '0.5rem', border: '1px solid #FEE2E2', background: 'transparent', color: '#EF4444', borderRadius: '0.75rem', cursor: 'pointer' }}>
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Same Modals as Dashboard for Consistency */}
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
                                    const conf: any = {
                                        ROUTINE: { border: '#8BAD89', bg: '#8BAD8910', text: '#3E5C3C' },
                                        URGENT: { border: '#F59E0B', bg: '#F59E0B10', text: '#92400E' },
                                        EMERGENCY: { border: '#EF4444', bg: '#EF444410', text: '#991B1B' },
                                        CRITICAL: { border: '#7C3AED', bg: '#7C3AED10', text: '#5B21B6' }
                                    }[level];
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
                            <textarea 
                                placeholder="Reason for cancellation..."
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', height: '100px', resize: 'none', outline: 'none' }}
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
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .table-row:hover { background-color: #F8FAFC; }
                .action-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); transition: all 0.2s; }
                .action-btn-secondary:hover { background-color: #E2E8F0 !important; transform: translateY(-1px); transition: all 0.2s; }
            `}</style>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button 
        onClick={onClick}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '0.75rem', 
            border: 'none', 
            background: active ? 'white' : 'transparent', 
            color: active ? '#1E293B' : '#64748B', 
            fontWeight: 800, 
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
        }}
    >
        <Icon size={18} color={active ? '#8BAD89' : '#94A3B8'} />
        {label}
        {count !== undefined && <span style={{ padding: '0.1rem 0.5rem', background: '#8BAD89', color: 'white', borderRadius: '6px', fontSize: '0.7rem' }}>{count}</span>}
    </button>
);

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const colors: any = {
        ROUTINE: { bg: '#F1F5F9', text: '#475569' },
        URGENT: { bg: '#FFF7ED', text: '#C2410C' },
        EMERGENCY: { bg: '#FEF2F2', text: '#B91C1C' },
        CRITICAL: { bg: '#F5F3FF', text: '#6D28D9' }
    };
    const { bg, text } = colors[urgency] || colors.ROUTINE;
    return (
        <span style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: bg, color: text, fontSize: '0.75rem', fontWeight: 800 }}>
            {urgency || 'ROUTINE'}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
        REQUESTED: { bg: '#EFF6FF', text: '#1E40AF' },
        TRIAGED: { bg: '#F5F3FF', text: '#5B21B6' },
        SCHEDULED: { bg: '#ECFDF5', text: '#065F46' },
        CHECKED_IN: { bg: '#DCFCE7', text: '#166534' },
        CANCELLED: { bg: '#FEF2F2', text: '#991B1B' },
        COMPLETED: { bg: '#F8FAFC', text: '#64748B' }
    };
    const { bg, text } = colors[status] || { bg: '#F1F5F9', text: '#475569' };
    return (
        <span style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: bg, color: text, fontSize: '0.75rem', fontWeight: 800 }}>
            {status}
        </span>
    );
};

export default ReceptionistAppointments;
