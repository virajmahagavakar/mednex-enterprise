import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Activity, FileText, AlertCircle } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientDashboardStatsDTO, PatientAppointmentResponseDTO } from '../../services/api.types';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<PatientDashboardStatsDTO>({
        upcomingAppointments: 0,
        totalPrescriptions: 0,
        unreadMessages: 0,
        nextAppointmentDate: null
    });
    const [nextAppointment, setNextAppointment] = useState<PatientAppointmentResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [statsData, appointmentsData] = await Promise.all([
                    PatientService.getDashboardStats(),
                    PatientService.getPatientAppointments()
                ]);
                
                setStats(statsData);

                // Find the soonest upcoming appointment
                const now = new Date();
                const upcoming = appointmentsData
                    .filter(app => new Date(app.appointmentTime) > now && app.status !== 'CANCELLED')
                    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());

                if (upcoming.length > 0) {
                    setNextAppointment(upcoming[0]);
                }
                
                setError('');
            } catch (err: any) {
                console.error('Dashboard load error:', err);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Activity size={36} color="var(--primary-color)" className="animate-spin" />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Here is an overview of your health information.</p>
            </div>

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#b91c1c' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.9rem' }}>{error}</span>
                </div>
            )}

            {/* Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Stat Card 1 */}
                <div className="card bg-gradient-healing" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={24} color="var(--primary-dark)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-dark)', lineHeight: 1 }}>{stats.upcomingAppointments}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Upcoming Appointments</div>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient-portal/records')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} color="var(--accent-dark)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalPrescriptions}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Active Prescriptions</div>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient-portal/records')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} color="#0284C7" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.unreadMessages || 0}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Lab Reports</div>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
                        <Clock size={20} /> Next Appointment
                    </h2>

                    {nextAppointment ? (
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Dr. {nextAppointment.doctorName}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{nextAppointment.specialization}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <Calendar size={14} /> 
                                    {new Date(nextAppointment.appointmentTime).toLocaleString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <button className="btn-accent" onClick={() => navigate('/patient-portal/appointments')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Details</button>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)' }}>
                            <Calendar size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>No Upcoming Appointments</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Book a new visit with your healthcare provider.</p>
                            <button onClick={() => navigate('/patient-portal/book-appointment')} className="btn-primary" style={{ width: 'auto', margin: '0 auto' }}>Book Appointment</button>
                        </div>
                    )}
                </div>

                <div className="card" style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
                        <Activity size={20} /> Quick Actions
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/patient-portal/book-appointment')}
                            className="btn-outline" 
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', gap: '0.5rem' }}
                        >
                            <Calendar size={24} />
                            <span>Book Visit</span>
                        </button>
                        <button 
                            onClick={() => navigate('/patient-portal/records')}
                            className="btn-outline" 
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', gap: '0.5rem' }}
                        >
                            <FileText size={24} />
                            <span>My Records</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
