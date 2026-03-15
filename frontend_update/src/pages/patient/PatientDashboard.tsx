import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    FileText, 
    Bell, 
    Search, 
    ArrowRight, 
    Activity, 
    MapPin, 
    Phone, 
    AlertTriangle,
    PlusCircle,
    UserCircle,
    ClipboardList,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/patient.service';
import { AmbulanceService } from '../../services/ambulance.service';
import type { PatientDashboardStatsDTO } from '../../services/api.types';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div style={{ 
        background: '#FFFFFF', 
        padding: '1.5rem', 
        borderRadius: '1.25rem', 
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    }} className="hover-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.6rem', background: `${color}15`, borderRadius: '12px', color: color }}>
                <Icon size={22} />
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                    <TrendingUp size={14} /> {trend}
                </div>
            )}
        </div>
        <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>{value}</p>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, description, onClick, color }: any) => (
    <button 
        onClick={onClick}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem', 
            padding: '1.25rem', 
            background: '#FFFFFF', 
            border: '1px solid #E2E8F0', 
            borderRadius: '1.25rem', 
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
        }}
        className="quick-action"
    >
        <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: `${color}10`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: color 
        }}>
            <Icon size={24} />
        </div>
        <div style={{ flex: 1 }}>
            <h5 style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.1rem', fontSize: '1rem' }}>{label}</h5>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{description}</p>
        </div>
        <ChevronRight size={18} color="#94A3B8" />
    </button>
);

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<PatientDashboardStatsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [ambulanceRequesting, setAmbulanceRequesting] = useState(false);
    const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
    const [ambulanceForm, setAmbulanceForm] = useState({
        address: '',
        emergencyType: 'Emergency Specialist Visit',
        phoneNumber: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await PatientService.getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleAmbulanceRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAmbulanceRequesting(true);
            await AmbulanceService.requestAmbulance(ambulanceForm);
            alert('Ambulance requested successfully! Help is on the way.');
            setShowAmbulanceModal(false);
        } catch (err) {
            alert('Failed to request ambulance. Please call emergency services directly.');
        } finally {
            setAmbulanceRequesting(false);
        }
    };

    const colors = {
        primary: '#8BAD89',
        secondary: '#64748B',
        accent: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        bg: '#F7F8F3'
    };

    return (
        <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', color: colors.secondary, fontWeight: 500 }}>Welcome back,</span>
                        <span style={{ padding: '0.25rem 0.6rem', background: `${colors.primary}15`, color: colors.primary, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFIED PATIENT</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>Your Health Overview</h1>
                </div>
                
                {/* Emergency Button */}
                <button 
                    onClick={() => setShowAmbulanceModal(true)}
                    style={{ 
                        background: colors.danger, 
                        color: 'white', 
                        padding: '1rem 2rem', 
                        borderRadius: '1rem', 
                        border: 'none', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: `0 8px 16px ${colors.danger}30`,
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e: any) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e: any) => e.target.style.transform = 'scale(1)'}
                >
                    <PlusCircle size={24} />
                    REQUEST AMBULANCE
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
                <main>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <StatCard title="Upcoming Visits" value={stats?.upcomingAppointments || 0} icon={Calendar} color={colors.info} />
                        <StatCard title="Active Prescriptions" value={stats?.totalPrescriptions || 0} icon={ClipboardList} color={colors.primary} />
                        <StatCard title="Lab Reports" value={stats?.recentLabResults || 0} icon={Activity} color={colors.accent} trend="+2 new" />
                        <StatCard title="Health Score" value="92%" icon={Activity} color="#10B981" />
                    </div>

                    {/* Next Appointment Hero */}
                    <div style={{ 
                        background: `linear-gradient(135deg, ${colors.primary}, #6F8E6E)`, 
                        borderRadius: '2rem', 
                        padding: '2.5rem', 
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '3rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 20px 40px ${colors.primary}25`
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '99px', width: 'fit-content', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                <Clock size={16} /> NEXT APPOINTMENT
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {stats?.nextAppointmentDate ? new Date(stats.nextAppointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'No visits scheduled'}
                            </h2>
                            <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2rem' }}>
                                {stats?.nextAppointmentDate ? `at ${new Date(stats.nextAppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Main Medical Center` : 'Book a visit now to get started.'}
                            </p>
                            <button 
                                onClick={() => navigate(stats?.nextAppointmentDate ? '/patient-portal/appointments' : '/patient-portal/book-appointment')}
                                style={{ 
                                    background: 'white', 
                                    color: colors.primary, 
                                    padding: '0.85rem 1.75rem', 
                                    borderRadius: '0.75rem', 
                                    border: 'none', 
                                    fontWeight: 700, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {stats?.nextAppointmentDate ? 'View Details' : 'Schedule Now'} <ArrowRight size={18} />
                            </button>
                        </div>
                        <Activity size={180} style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.1, color: 'white' }} />
                    </div>

                    {/* Recent Activity or Chart could go here */}
                    <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Your Progress</h3>
                            <select style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '0 1rem' }}>
                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} style={{ flex: 1, background: i === 5 ? colors.primary : '#E2E8F0', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'all 0.3s' }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '0.7rem', color: colors.secondary, fontWeight: 600 }}>
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
                        </div>
                    </div>
                </main>

                <aside>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <section>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: '#1E293B' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <QuickAction 
                                    icon={PlusCircle} 
                                    label="Book Visit" 
                                    description="Schedule a new consultation"
                                    onClick={() => navigate('/patient-portal/book-appointment')}
                                    color={colors.primary}
                                />
                                <QuickAction 
                                    icon={FileText} 
                                    label="Medical Records" 
                                    description="View test results & history"
                                    onClick={() => navigate('/patient-portal/records')}
                                    color={colors.info}
                                />
                                <QuickAction 
                                    icon={UserCircle} 
                                    label="Update Profile" 
                                    description="Manage contact & health info"
                                    onClick={() => navigate('/patient-portal/profile')}
                                    color={colors.secondary}
                                />
                            </div>
                        </section>

                        {/* Recent Alerts */}
                        <section style={{ background: '#F8FAFC', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={18} color={colors.accent} /> Latest Updates
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent, marginTop: '5px' }} />
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>Prescription ready</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Dr. Smith uploaded your script</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.primary, marginTop: '5px' }} />
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>Lab Result: Normal</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>CBC Panel completed at 09:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div style={{ padding: '1.25rem', borderRadius: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <Phone size={24} color={colors.primary} style={{ marginBottom: '0.5rem' }} />
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>24/7 Support</h4>
                            <p style={{ fontSize: '0.75rem', color: colors.secondary }}>+1 (555) 000-HEALTH</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Ambulance Modal */}
            {showAmbulanceModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.6)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ 
                        background: 'white', 
                        padding: '2.5rem', 
                        borderRadius: '2rem', 
                        width: '500px', 
                        maxWidth: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: colors.danger, marginBottom: '1.5rem' }}>
                            <AlertTriangle size={32} />
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Emergency Call</h2>
                        </div>
                        <p style={{ marginBottom: '2rem', color: colors.secondary, fontSize: '1.1rem' }}>
                            Please confirm your location and contact details. An ambulance will be dispatched immediately.
                        </p>
                        
                        <form onSubmit={handleAmbulanceRequest}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1E293B' }}>Pickup Address</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin style={{ position: 'absolute', left: '12px', top: '14px', color: colors.primary }} size={18} />
                                    <input 
                                        required
                                        placeholder="Full address where help is needed"
                                        value={ambulanceForm.address}
                                        onChange={e => setAmbulanceForm({...ambulanceForm, address: e.target.value})}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1E293B' }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone style={{ position: 'absolute', left: '12px', top: '14px', color: colors.primary }} size={18} />
                                    <input 
                                        required
                                        type="tel"
                                        placeholder="Active phone for dispatcher to call"
                                        value={ambulanceForm.phoneNumber}
                                        onChange={e => setAmbulanceForm({...ambulanceForm, phoneNumber: e.target.value})}
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAmbulanceModal(false)}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={ambulanceRequesting}
                                    style={{ 
                                        flex: 2, 
                                        padding: '1rem', 
                                        borderRadius: '1rem', 
                                        border: 'none', 
                                        background: colors.danger, 
                                        color: 'white', 
                                        fontWeight: 800, 
                                        cursor: ambulanceRequesting ? 'not-allowed' : 'pointer',
                                        opacity: ambulanceRequesting ? 0.7 : 1
                                    }}
                                >
                                    {ambulanceRequesting ? 'REQUESTING...' : 'DISPATCH NOW'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .hover-card:hover { transform: translateY(-5px); border-color: ${colors.primary} !important; }
                .quick-action:hover { border-color: ${colors.primary} !important; background: #F8FAFC !important; }
                .quick-action:hover svg { transform: translateX(2px); transition: transform 0.2s; }
            `}</style>
        </div>
    );
}
