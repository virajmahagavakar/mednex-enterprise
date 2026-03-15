import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    LogOut,
    LayoutDashboard,
    Menu,
    UserCircle,
    Activity
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';
import ProfileModal from '../shared/ProfileModal';

interface JWTPayload {
    sub: string;
    roles?: string[];
    hospital_id?: string;
    name?: string;
    email?: string;
    exp: number;
}

const DoctorLayout = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('Doctor');
    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('Doctor');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        const token = TokenService.getToken();
        if (!token) {
            navigate('/login');
        } else {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                setUserName(decoded.name || 'Doctor');
                setUserEmail(decoded.email || '');

                let roleDisplay = 'Doctor';
                if (decoded.roles && decoded.roles.length > 0) {
                    roleDisplay = decoded.roles[0]
                        .replace('ROLE_', '')
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                }
                setUserRole(roleDisplay);
            } catch (e) {
                console.error("Invalid token format", e);
            }
        }
    }, [navigate]);

    const handleOpenProfile = () => {
        setIsProfileModalOpen(true);
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Patients', path: '/doctor/patients', icon: <Users size={20} /> },
        { name: 'IPD', path: '/doctor/ipd', icon: <Activity size={20} /> },
        { name: 'Appointments', path: '/doctor/appointments', icon: <Calendar size={20} /> },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Mednex Enterprise</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn">
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">Doctor Portal</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-profile-container">
                            <div className="user-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
                                <div className="user-info">
                                    <span className="user-name">{userName}</span>
                                    <span className="user-role">{userRole}</span>
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <p className="dropdown-name">{userName}</p>
                                        <p className="dropdown-role">{userRole}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleOpenProfile}>
                                        <UserCircle size={16} />
                                        <span>My Profile</span>
                                    </button>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userName={userName}
                userEmail={userEmail}
                userRole={userRole}
                onProfileUpdated={(name) => {
                    setUserName(name);
                }}
            />

            <style>
                {`
          /* Reusing the styling classes from AdminLayout conceptually */
          .admin-layout { display: flex; min-height: 100vh; background-color: var(--bg-main); }
          .sidebar { width: 260px; background-color: var(--bg-sidebar); color: white; display: flex; flex-direction: column; z-index: 10; }
          .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
          .sidebar-header h2 { color: white; font-size: 1.25rem; margin: 0; }
          .sidebar-nav { flex: 1; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
          .nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; text-decoration: none; border-left: 3px solid transparent; }
          .nav-link:hover { background-color: var(--bg-sidebar-hover); color: white; }
          .nav-link.active { background-color: var(--bg-sidebar-hover); color: white; border-left-color: var(--primary); }
          .sidebar-footer { padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
          .logout-btn { display: flex; align-items: center; gap: 0.75rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 0; }
          .logout-btn:hover { color: var(--danger); }
          .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
          .top-header { height: 72px; background-color: white; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; box-shadow: var(--shadow-sm); z-index: 5; }
          .header-left { display: flex; align-items: center; gap: 1rem; }
          .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; }
          .page-title { font-size: 1.25rem; color: var(--text-primary); margin: 0; }
          .user-profile-container { position: relative; }
          .user-profile { display: flex; align-items: center; gap: 1rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-md); }
          .user-profile:hover { background-color: var(--bg-main); }
          .avatar { width: 40px; height: 40px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.125rem; }
          .user-info { display: flex; flex-direction: column; }
          .user-name { font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
          .user-role { font-size: 0.75rem; color: var(--text-secondary); }
          .content-area { flex: 1; padding: 2rem; overflow-y: auto; }
          .profile-dropdown { position: absolute; top: calc(100% + 0.5rem); right: 0; width: 240px; background-color: white; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); border: 1px solid var(--border-light); z-index: 100; }
          .dropdown-header { padding: 1rem; background-color: #FAFCFF; border-bottom: 1px solid var(--border-light); border-radius: var(--radius-md) var(--radius-md) 0 0; }
          .dropdown-name { font-weight: 600; font-size: 0.875rem; margin: 0 0 0.25rem 0; word-break: break-all; }
          .dropdown-role { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
          .dropdown-divider { height: 1px; background-color: var(--border-light); margin: 0.5rem 0; }
          .dropdown-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; text-align: left; background: none; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
          .dropdown-item:hover { background-color: var(--bg-main); color: var(--primary); }
          .dropdown-item.text-danger { color: var(--danger); }
          .dropdown-item.text-danger:hover { background-color: #FEF2F2; }
        `}
            </style>
        </div>
    );
};

export default DoctorLayout;
