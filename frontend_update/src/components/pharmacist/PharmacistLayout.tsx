import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  Menu,
  Pill,
  Syringe,
  PackageSearch
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  roles?: string[];
  hospital_id?: string;
  exp: number;
}

const PharmacistLayout = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('Pharmacist User');
  const [userRole] = useState<string>('Pharmacist');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const token = TokenService.getToken();
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserEmail(decoded.sub || 'Pharmacist User');

        // Verify Pharmacist Role
        if (!decoded.roles?.includes('ROLE_PHARMACIST')) {
          // Redirect unauthorized users
          navigate('/login');
        }
      } catch (e) {
        console.error("Invalid token format", e);
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/pharmacist/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/pharmacist/inventory', icon: <PackageSearch size={20} /> },
    { name: 'Suppliers', path: '/pharmacist/suppliers', icon: <Pill size={20} /> },
    { name: 'Dispense', path: '/pharmacist/dispense', icon: <Syringe size={20} /> }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar flex-shrink-0">
        <div className="sidebar-header">
          <h2>Mednex Pharmacy</h2>
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
      <main className="main-content flex-grow-1 min-w-0">
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn">
              <Menu size={24} />
            </button>
            <h1 className="page-title">Pharmacist Workspace</h1>
          </div>
          <div className="header-right">
            <div className="user-profile-container">
              <div className="user-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="avatar">{userEmail.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{userEmail}</span>
                  <span className="user-role">{userRole}</span>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{userEmail}</p>
                    <p className="dropdown-role">{userRole}</p>
                  </div>
                  <div className="dropdown-divider"></div>
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

      <style>
        {`
          /* Uses exact same layout classes as Admin and Doctor workspaces */
          .admin-layout {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-main);
          }

          /* Sidebar Styles */
          .sidebar {
            width: 260px;
            background-color: #0f172a; /* Slate 900 for distinct flavor */
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
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .nav-link.active {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
            border-left-color: #3b82f6; /* Blue 500 */
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
            background: none;
            border: none;
            cursor: pointer;
          }

          .logout-btn:hover {
            color: var(--danger);
          }
          
          .btn-primary {
            background-color: var(--primary);
            color: white;
            border: none;
            cursor: pointer;
            padding: 0.625rem 1.25rem;
            border-radius: var(--radius-md);
            font-weight: 500;
            transition: all var(--transition-fast);
          }
          
          .btn-primary:hover:not(:disabled) {
            background-color: var(--primary-dark);
          }

          /* Main Content Styles */
          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            width: 100%;
            min-width: 0;
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
            background: none;
            border: none;
            cursor: pointer;
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
            background-color: #dbeafe; /* Blue 100 */
            color: #2563eb; /* Blue 600 */
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
            width: 100%;
          }

          /* Dropdown Styles */
          .user-profile-container {
            position: relative;
          }
          
          .profile-dropdown {
            position: absolute;
            top: calc(100% + 0.5rem);
            right: 0;
            width: 240px;
            background-color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-light);
            z-index: 100;
            animation: slideDown 0.2s ease;
          }
          
          .dropdown-header {
            padding: 1rem;
            background-color: #FAFCFF;
            border-bottom: 1px solid var(--border-light);
            border-top-left-radius: var(--radius-md);
            border-top-right-radius: var(--radius-md);
          }
          
          .dropdown-name {
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 0.25rem 0;
            font-size: 0.875rem;
            word-break: break-all;
          }
          
          .dropdown-role {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin: 0;
          }
          
          .dropdown-divider {
            height: 1px;
            background-color: var(--border-light);
            margin: 0.5rem 0;
          }
          
          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            text-align: left;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .dropdown-item:hover {
            background-color: var(--bg-main);
            color: var(--primary);
          }
          
          .dropdown-item.text-danger:hover {
            color: var(--danger);
            background-color: #FEF2F2;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default PharmacistLayout;
