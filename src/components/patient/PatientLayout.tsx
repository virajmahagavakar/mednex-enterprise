import { Outlet, useNavigate } from 'react-router-dom';
import { Activity, Calendar, FileText, Settings, LogOut } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import '../../styles/patient-theme.css';

const PatientLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <div className="patient-theme">
            {/* Top Navigation */}
            <header className="patient-topbar">
                <div className="patient-logo">
                    <Activity size={24} color="var(--primary)" />
                    Mednex Patient Portal
                </div>

                <nav className="patient-nav">
                    <a href="#" className="active" onClick={(e) => { e.preventDefault(); navigate('/patient-portal/dashboard'); }}>
                        <Activity size={18} /> Dashboard
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/patient-portal/appointments'); }}>
                        <Calendar size={18} /> Appointments
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/patient-portal/records'); }}>
                        <FileText size={18} /> Medical Records
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/patient-portal/profile'); }}>
                        <Settings size={18} /> Profile
                    </a>
                </nav>

                <button
                    onClick={handleLogout}
                    className="btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </header>

            {/* Main Content Area */}
            <main className="patient-content">
                <Outlet />
            </main>
        </div>
    );
};

export default PatientLayout;
