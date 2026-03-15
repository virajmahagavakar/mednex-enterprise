import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    User, 
    MapPin, 
    Tag, 
    Search,
    CheckCircle2,
    XCircle,
    Clock3,
    Activity
} from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientAppointmentResponseDTO } from '../../services/api.types';

type AppointmentStatus = PatientAppointmentResponseDTO['status'];

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const config: Record<string, { color: string, bg: string, icon: any }> = {
        'REQUESTED': { color: '#B45309', bg: '#FEF3C7', icon: Clock3 },
        'TRIAGED': { color: '#B45309', bg: '#FEF3C7', icon: Clock3 },
        'PENDING': { color: '#B45309', bg: '#FEF3C7', icon: Clock3 },
        'CONFIRMED': { color: '#1E40AF', bg: '#DBEAFE', icon: CheckCircle2 },
        'SCHEDULED': { color: '#1E40AF', bg: '#DBEAFE', icon: CheckCircle2 },
        'CHECKED_IN': { color: '#065F46', bg: '#D1FAE5', icon: Activity },
        'COMPLETED': { color: '#166534', bg: '#DCFCE7', icon: CheckCircle2 },
        'CANCELLED': { color: '#991B1B', bg: '#FEE2E2', icon: XCircle },
    };

    const { color, bg, icon: Icon } = config[status] || config['PENDING'];

    return (
        <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.35rem 0.75rem', 
            borderRadius: '99px', 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            backgroundColor: bg, 
            color: color 
        }}>
            <Icon size={14} />
            {status}
        </span>
    );
};



export default function Appointments() {
    const [appointments, setAppointments] = useState<PatientAppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await PatientService.getPatientAppointments();
            setAppointments(data);
        } catch (err) {
            console.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = (app.doctorName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (app.specialization ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'ALL') return matchesSearch;
        if (filter === 'UPCOMING') return matchesSearch && (app.status === 'CONFIRMED' || app.status === 'SCHEDULED' || app.status === 'CHECKED_IN');
        if (filter === 'PENDING') return matchesSearch && (app.status === 'REQUESTED' || app.status === 'TRIAGED' || app.status === 'PENDING');
        if (filter === 'COMPLETED') return matchesSearch && app.status === 'COMPLETED';
        if (filter === 'CANCELLED') return matchesSearch && app.status === 'CANCELLED';
        return matchesSearch;
    });

    const colors = {
        primary: '#8BAD89',
        bg: '#F7F8F3',
        text: '#161616',
        textLight: '#525252',
        border: '#E2E8F0',
        white: '#FFFFFF'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem' }}>
                        My Appointments
                    </h1>
                    <p style={{ color: colors.textLight }}>Track and manage your healthcare journey</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textLight }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Search doctor or dept..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                borderRadius: '0.75rem', 
                                border: `1px solid ${colors.border}`, 
                                width: '250px',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {(['ALL', 'UPCOMING', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{ 
                            padding: '0.6rem 1.25rem', 
                            borderRadius: '99px', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: filter === f ? colors.primary : colors.white,
                            color: filter === f ? colors.white : colors.textLight,
                            border: `1px solid ${filter === f ? colors.primary : colors.border}`
                        }}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.primary}20`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: colors.white, borderRadius: '1.5rem', border: `1px solid ${colors.border}` }}>
                    <Calendar size={48} color={colors.border} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Appointments Found</h3>
                    <p style={{ color: colors.textLight }}>Try adjusting your filters or book a new appointment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredAppointments.map((app) => (
                        <div key={app.id} style={{ 
                            background: colors.white, 
                            borderRadius: '1.25rem', 
                            padding: '1.5rem', 
                            border: `1px solid ${colors.border}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            position: 'relative',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }} className="appt-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${colors.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        {app.doctorName ? (
                                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>Dr. {app.doctorName}</h3>
                                        ) : (
                                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem', color: colors.textLight, fontStyle: 'italic', animation: 'pulse 2s infinite' }}>
                                                Processing for Appointment
                                            </h3>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colors.textLight, fontSize: '0.8rem' }}>
                                            <Tag size={12} />
                                            {app.specialization || 'General Consultation'}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: colors.bg, borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: colors.textLight, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                        <Calendar size={14} color={colors.primary} />
                                        {app.appointmentTime ? new Date(app.appointmentTime).toLocaleDateString() : new Date(app.preferredDate!).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: colors.textLight, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                        <Clock size={14} color={colors.primary} />
                                        {app.appointmentTime ? (
                                            new Date(app.appointmentTime).getHours() === 0 && new Date(app.appointmentTime).getMinutes() === 0
                                                ? 'Time TBD'
                                                : new Date(app.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        ) : 'Time TBD'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: colors.textLight, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MapPin size={14} /> Main Branch
                                </div>
                                {app.tokenNumber && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: colors.primary, background: `${colors.primary}10`, padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                                        Token #{app.tokenNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                .appt-card:hover { transform: translateY(-4px); border-color: ${colors.primary} !important; }
            `}</style>
        </div>
    );
}
