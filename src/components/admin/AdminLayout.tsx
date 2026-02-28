import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Building2,
    Users,
    Settings,
    CreditCard,
    LogOut,
    LayoutDashboard,
    Menu
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Branches', path: '/admin/branches', icon: <Building2 size={20} /> },
        { name: 'Staff & Roles', path: '/admin/staff', icon: <Users size={20} /> },
        { name: 'Subscription', path: '/admin/subscription', icon: <CreditCard size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
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
                        <h1 className="page-title">Admin Console</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-profile">
                            <div className="avatar">A</div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Hospital Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>

            <style>
                {`
          .admin-layout {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-main);
          }

          /* Sidebar Styles */
          .sidebar {
            width: 260px;
            background-color: var(--bg-sidebar);
            color: white;
            display: flex;
            flex-direction: column;
            transition: all var(--transition-normal);
            z-index: 10;
          }

          .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .sidebar-header h2 {
            color: white;
            font-size: 1.25rem;
            margin: 0;
            letter-spacing: 0.5px;
          }

          .sidebar-nav {
            flex: 1;
            padding: 1.5rem 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
            transition: all var(--transition-fast);
            border-left: 3px solid transparent;
          }

          .nav-link:hover {
            background-color: var(--bg-sidebar-hover);
            color: white;
          }

          .nav-link.active {
            background-color: var(--bg-sidebar-hover);
            color: white;
            border-left-color: var(--primary);
          }

          .sidebar-footer {
            padding: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .logout-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
            width: 100%;
            text-align: left;
            transition: all var(--transition-fast);
          }

          .logout-btn:hover {
            color: var(--danger);
          }

          /* Main Content Styles */
          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .top-header {
            height: 72px;
            background-color: white;
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            box-shadow: var(--shadow-sm);
            z-index: 5;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .mobile-menu-btn {
            display: none;
            color: var(--text-secondary);
          }

          .page-title {
            font-size: 1.25rem;
            color: var(--text-primary);
            margin: 0;
          }

          .header-right {
            display: flex;
            align-items: center;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: var(--radius-md);
            transition: background-color var(--transition-fast);
          }

          .user-profile:hover {
            background-color: var(--bg-main);
          }

          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary-light);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.125rem;
          }

          .user-info {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--text-primary);
          }

          .user-role {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .content-area {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .sidebar {
              position: fixed;
              left: -260px;
              height: 100vh;
            }
            .sidebar.open {
              left: 0;
            }
            .mobile-menu-btn {
              display: block;
            }
          }
        `}
            </style>
        </div>
    );
};

export default AdminLayout;
