import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '../../services/doctor.service';
import { TokenService } from '../../services/api.client';
import type { DoctorDashboardStatsDTO, AppointmentResponse, DashboardChartDataDTO, AdmissionDTO } from '../../services/api.types';
import { Users, Calendar, Clock, Activity, TrendingUp, UserPlus, ClipboardList } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DoctorDashboardStatsDTO | null>(null);
    const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([]);
    const [waitingQueue, setWaitingQueue] = useState<AppointmentResponse[]>([]);
    const [activeIpdPatients, setActiveIpdPatients] = useState<AdmissionDTO[]>([]);
    const [chartData, setChartData] = useState<DashboardChartDataDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const doctorName = TokenService.getUserName() || 'Doctor';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [statsData, todayApts, queueData, ipdData, trendData] = await Promise.all([
                DoctorService.getDashboardStats(),
                DoctorService.getTodayAppointments(),
                DoctorService.getWaitingQueue(),
                DoctorService.getAdmissionsByDoctor(),
                DoctorService.getDetailedStats()
            ]);
            setStats(statsData);
            setTodayAppointments(todayApts);
            setWaitingQueue(queueData);
            setActiveIpdPatients(ipdData.filter(a => a.status === 'ADMITTED').slice(0, 5));
            setChartData(trendData);
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
            case 'CHECKED_IN': return 'status-active';
            case 'IN_PROGRESS': return 'status-active';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const handleStartVisit = (appointment: AppointmentResponse) => {
        navigate(`/doctor/patient/${appointment.patientId}/emr?appointmentId=${appointment.id}`);
    };

    return (
        <div className="dashboard-wrapper">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="welcome-text">
                        Good day, Dr. {doctorName?.replace(/^(Dr\.|Dr|dr\.|dr)[.,\s]*/g, '').trim() || 'Doctor'}
                    </h1>
                    <p className="subtitle">You have {stats?.waitingQueueCount || 0} patients waiting in the queue.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-dash" onClick={() => navigate('/doctor/schedule')}>
                        <Calendar size={18} />
                        <span>Schedule</span>
                    </button>
                    <button className="btn-primary-dash" onClick={() => navigate('/doctor/appointments')}>
                        <UserPlus size={18} />
                        <span>New Consult</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid-premium">
                <div className="stat-card-premium blue">
                    <div className="stat-icon-wrapper">
                        <Users size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Total Patients</span>
                        <h3 className="value">{stats?.totalPatients || 0}</h3>
                        <span className="trend positive">+12% from last month</span>
                    </div>
                </div>
                <div className="stat-card-premium green">
                    <div className="stat-icon-wrapper">
                        <ClipboardList size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Today's Total</span>
                        <h3 className="value">{stats?.todayAppointments || 0}</h3>
                        <span className="trend">Next: {stats?.nextAppointmentTime || '---'}</span>
                    </div>
                </div>
                <div className="stat-card-premium yellow">
                    <div className="stat-icon-wrapper">
                        <Clock size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Waiting Queue</span>
                        <h3 className="value">{stats?.waitingQueueCount || 0}</h3>
                        <span className="trend warning">Needs attention</span>
                    </div>
                </div>
                <div className="stat-card-premium purple">
                    <div className="stat-icon-wrapper">
                        <Activity size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Active IPD</span>
                        <h3 className="value">{stats?.activeIpdPatients || 0}</h3>
                        <span className="trend">Current admitted</span>
                    </div>
                </div>
                <div className="stat-card-premium indigo">
                    <div className="stat-icon-wrapper">
                        <ClipboardList size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Completed Today</span>
                        <h3 className="value">{stats?.completedToday || 0}</h3>
                        <span className="trend positive">Great progress!</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main-grid">
                {/* Workload Chart */}
                <div className="chart-container card-premium">
                    <div className="card-header-premium">
                        <div className="header-title-group">
                            <TrendingUp size={20} className="header-icon" />
                            <h3>Clinical Workload Trends</h3>
                        </div>
                        <select className="period-select">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSeen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="patientsSeen" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSeen)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Previews Grid */}
                <div className="previews-grid">
                    {/* Waiting Queue */}
                    <div className="preview-panel card-premium">
                        <div className="card-header-premium">
                            <h3>Waiting Queue</h3>
                            <button className="view-all-link" onClick={() => navigate('/doctor/appointments')}>View Full Queue</button>
                        </div>
                        <div className="preview-list">
                            {isLoading ? (
                                <div className="loading-state-dash">Loading...</div>
                            ) : waitingQueue.length === 0 ? (
                                <div className="empty-state-dash">No patients waiting</div>
                            ) : (
                                waitingQueue.map(apt => (
                                    <div key={apt.id} className="preview-item">
                                        <div className="item-info">
                                            <span className="patient-name">{apt.patientName}</span>
                                            <span className="token-badge">Token #{apt.tokenNumber || 'N/A'}</span>
                                        </div>
                                        <button className="btn-action-small" onClick={() => handleStartVisit(apt)}>Start</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="preview-panel card-premium">
                        <div className="card-header-premium">
                            <h3>Upcoming</h3>
                            <button className="view-all-link" onClick={() => navigate('/doctor/appointments')}>Full Schedule</button>
                        </div>
                        <div className="preview-list">
                            {isLoading ? (
                                <div className="loading-state-dash">Loading...</div>
                            ) : todayAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').slice(0, 4).length === 0 ? (
                                <div className="empty-state-dash">No upcoming appointments</div>
                            ) : (
                                todayAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').slice(0, 4).map(apt => (
                                    <div key={apt.id} className="preview-item">
                                        <div className="item-info">
                                            <span className="patient-name">{apt.patientName}</span>
                                            <span className="time-info"><Clock size={12} /> {formatTime(apt.appointmentTime)}</span>
                                        </div>
                                        <span className={`status-dot ${getStatusBadgeClass(apt.status)}`}></span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active IPD */}
                    <div className="preview-panel card-premium">
                        <div className="card-header-premium">
                            <h3>Active IPD</h3>
                            <button className="view-all-link" onClick={() => navigate('/doctor/ipd')}>Manage IPD</button>
                        </div>
                        <div className="preview-list">
                            {isLoading ? (
                                <div className="loading-state-dash">Loading...</div>
                            ) : activeIpdPatients.length === 0 ? (
                                <div className="empty-state-dash">No admitted patients</div>
                            ) : (
                                activeIpdPatients.map(ipd => (
                                    <div key={ipd.id} className="preview-item" onClick={() => navigate(`/doctor/ipd/patient/${ipd.patientId}`)}>
                                        <div className="item-info">
                                            <span className="patient-name">{ipd.patientName}</span>
                                            <span className="bed-info">{ipd.wardName} - Bed {ipd.bedNumber}</span>
                                        </div>
                                        <Activity size={16} className="item-icon-small" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .dashboard-wrapper { display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem; padding-bottom: 2rem; }
                    
                    /* Header Area */
                    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; }
                    .welcome-text { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
                    .subtitle { color: #64748b; font-size: 1rem; }
                    .header-actions { display: flex; gap: 0.75rem; }
                    
                    .btn-primary-dash { display: flex; align-items: center; gap: 0.5rem; background: #2563eb; color: white; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                    .btn-primary-dash:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
                    
                    .btn-secondary-dash { display: flex; align-items: center; gap: 0.5rem; background: white; color: #0f172a; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 600; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; }
                    .btn-secondary-dash:hover { background: #f8fafc; border-color: #cbd5e1; }

                    /* Premium Stats Grid */
                    .stats-grid-premium { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; }
                    .stat-card-premium { background: white; border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: relative; overflow: hidden; }
                    
                    .stat-icon-wrapper { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
                    .stat-info { display: flex; flex-direction: column; }
                    .stat-info .label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
                    .stat-info .value { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0; letter-spacing: -0.025em; }
                    .trend { font-size: 0.75rem; font-weight: 600; }
                    .trend.positive { color: #10b981; }
                    .trend.warning { color: #f59e0b; }
                    
                    .blue { color: #2563eb; } .blue .stat-icon-wrapper { background: #eff6ff; }
                    .green { color: #059669; } .green .stat-icon-wrapper { background: #ecfdf5; }
                    .yellow { color: #d97706; } .yellow .stat-icon-wrapper { background: #fffbeb; }
                    .purple { color: #7c3aed; } .purple .stat-icon-wrapper { background: #f5f3ff; }
                    .indigo { color: #4f46e5; } .indigo .stat-icon-wrapper { background: #eef2ff; }

                    /* Main Layout */
                    .dashboard-main-grid { display: flex; flex-direction: column; gap: 1.5rem; }
                    .card-premium { background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                    
                    .card-header-premium { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                    .header-title-group { display: flex; align-items: center; gap: 0.75rem; }
                    .header-title-group h3 { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0; }
                    .header-icon { color: #2563eb; }
                    
                    .period-select { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.875rem; font-weight: 500; color: #475569; outline: none; }
                    
                    .chart-wrapper { padding: 1.5rem; }

                    /* Previews Grid */
                    .previews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                    .preview-panel { display: flex; flex-direction: column; height: 100%; }
                    .view-all-link { background: none; border: none; color: #2563eb; font-size: 0.875rem; font-weight: 600; cursor: pointer; padding: 0; }
                    .view-all-link:hover { text-decoration: underline; }
                    
                    .preview-list { display: flex; flex-direction: column; }
                    .preview-item { padding: 1rem 1.5rem; border-bottom: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
                    .preview-item:last-child { border-bottom: none; }
                    .preview-item:hover { background-color: #f8fafc; cursor: pointer; }
                    
                    .item-info { display: flex; flex-direction: column; gap: 0.125rem; }
                    .patient-name { font-weight: 600; color: #1e293b; font-size: 0.9375rem; }
                    .token-badge { font-size: 0.75rem; color: #64748b; font-weight: 500; }
                    .time-info { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #64748b; font-weight: 500; }
                    .bed-info { font-size: 0.75rem; color: #64748b; font-weight: 500; }
                    
                    .btn-action-small { background: #eff6ff; color: #2563eb; border: none; padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                    .btn-action-small:hover { background: #2563eb; color: white; }
                    
                    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                    .status-dot.status-upcoming { background-color: #f59e0b; }
                    .status-dot.status-active { background-color: #2563eb; }
                    .status-dot.status-completed { background-color: #10b981; }
                    
                    .item-icon-small { color: #94a3b8; }
                    
                    .empty-state-dash { padding: 3rem 1.5rem; text-align: center; color: #94a3b8; font-size: 0.875rem; }
                    .loading-state-dash { padding: 3rem 1.5rem; text-align: center; color: #64748b; font-size: 0.875rem; }

                    @media (max-width: 1280px) {
                        .stats-grid-premium { grid-template-columns: repeat(3, 1fr); }
                        .previews-grid { grid-template-columns: repeat(2, 1fr); }
                    }
                    @media (max-width: 768px) {
                        .stats-grid-premium { grid-template-columns: repeat(2, 1fr); }
                        .previews-grid { grid-template-columns: 1fr; }
                    }
                `}
            </style>
        </div>
    );
};

export default DoctorDashboard;
