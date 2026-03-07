import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Activity, FileText } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientAppointmentResponseDTO } from '../../services/api.types';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalPrescriptions: 0,
        labReports: 0,
    });
    const [nextAppointment, setNextAppointment] = useState<PatientAppointmentResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [dashStats, appointments] = await Promise.all([
                PatientService.getDashboardStats().catch(() => null),
                PatientService.getPatientAppointments().catch(() => [] as PatientAppointmentResponseDTO[]),
            ]);

            if (dashStats) {
                setStats({
                    upcomingAppointments: dashStats.upcomingAppointments ?? 0,
                    totalPrescriptions: dashStats.pendingPrescriptions ?? 0,
                    labReports: dashStats.recentLabResults ?? 0,
                });
            }

            // Find the next upcoming appointment (earliest future one)
            const now = new Date();
            const upcoming = (appointments as PatientAppointmentResponseDTO[])
                .filter(a => new Date(a.appointmentTime) > now && a.status !== 'CANCELLED')
                .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());

            setNextAppointment(upcoming[0] ?? null);
            if (!dashStats) {
                setStats(prev => ({ ...prev, upcomingAppointments: upcoming.length }));
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatAppointmentTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Here is an overview of your health information.</p>
            </div>

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
                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} color="#0284C7" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.labReports}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Lab Reports</div>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
                        <Clock size={20} /> Next Appointment
                    </h2>

                    {nextAppointment ? (
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{nextAppointment.doctorName ?? 'Your Doctor'}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{nextAppointment.reasonForVisit ?? 'Consultation'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <Calendar size={14} /> {formatAppointmentTime(nextAppointment.appointmentTime)}
                                </div>
                            </div>
                            <button className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/patient-portal/appointments')}>View</button>
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
                        <Activity size={20} /> Latest Vitals
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                        No vitals recorded yet.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
