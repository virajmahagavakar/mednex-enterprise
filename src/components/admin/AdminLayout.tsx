import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Settings,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Menu,
  UserCircle
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/api.client';
import { AdminService } from '../../services/admin.service';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  roles?: string[];
  hospital_id?: string;
  exp: number;
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('Admin User');
  const [userRole, setUserRole] = useState<string>('Hospital Admin');
  const [userContact, setUserContact] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Custom fetch function to get live profile details
  const fetchProfileDetails = async () => {
    try {
      const profile = await AdminService.getProfile();
      setUserEmail(profile.name || profile.email);
      setUserContact(profile.contactNumber || 'Not Provided');
      setEditName(profile.name || '');
      setEditContact(profile.contactNumber || '');
    } catch (e) {
      console.error("Failed to fetch fresh profile details", e);
    }
  };

  useEffect(() => {
    const token = TokenService.getToken();
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserEmail(decoded.sub || 'Admin User');

        let roleDisplay = 'Hospital Admin';
        if (decoded.roles && decoded.roles.length > 0) {
          // Format ROLE_HOSPITAL_ADMIN to Hospital Admin
          roleDisplay = decoded.roles[0]
            .replace('ROLE_', '')
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        setUserRole(roleDisplay);

        // Fetch full profile data
        fetchProfileDetails();
      } catch (e) {
        console.error("Invalid token format", e);
      }
    }
  }, [navigate]);

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
    setIsEditingProfile(false);
    fetchProfileDetails(); // Refresh when opening
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const updated = await AdminService.updateProfile({ name: editName, contactNumber: editContact });
      setUserEmail(updated.name || updated.email);
      setUserContact(updated.contactNumber || 'Not Provided');
      setIsEditingProfile(false);
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Hospital Admin', 'Branch Admin'] },
    { name: 'Branches', path: '/admin/branches', icon: <Building2 size={20} />, roles: ['Hospital Admin', 'Branch Admin'] },
    { name: 'Staff & Roles', path: '/admin/staff', icon: <Users size={20} />, roles: ['Hospital Admin', 'Branch Admin'] },
    { name: 'Subscription', path: '/admin/subscription', icon: <CreditCard size={20} />, roles: ['Hospital Admin', 'Branch Admin'] },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} />, roles: ['Hospital Admin'] },
  ].filter(item => item.roles.includes(userRole));

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

      {/* Admin Profile Modal */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content profile-modal">
            <div className="modal-header">
              <h3>Admin Profile</h3>
              <button className="icon-btn" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-hero">
                <div className="profile-avatar-large">{userEmail.charAt(0).toUpperCase()}</div>
                {!isEditingProfile ? (
                  <h2>{userEmail}</h2>
                ) : (
                  <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem', width: '80%' }} />
                )}
                <span className="role-badge">{userRole}</span>
              </div>

              <div className="profile-details-grid">
                <div className="detail-group">
                  <label>Contact Number (Emergency)</label>
                  {!isEditingProfile ? (
                    <p>{userContact}</p>
                  ) : (
                    <input type="text" className="input-field" value={editContact} onChange={(e) => setEditContact(e.target.value)} placeholder="Phone Number" style={{ width: '100%', padding: '0.25rem 0.5rem' }} />
                  )}
                </div>
                <div className="detail-group">
                  <label>Assigned Role</label>
                  <p>{userRole}</p>
                </div>
                <div className="detail-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Hospital Hierarchy Access</label>
                  <p>{userRole === 'Hospital Admin' ? 'All Branches (View Only), Main Branch (Full Access)' : 'Global Access'}</p>
                </div>
                <div className="detail-group">
                  <label>Account Status</label>
                  <p className="status-active">Active</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {!isEditingProfile ? (
                <>
                  <button className="btn-outline" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                  <button className="btn-primary" onClick={() => setIsProfileModalOpen(false)}>Close</button>
                </>
              ) : (
                <>
                  <button className="btn-outline" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
          
          .btn-primary {
            background-color: var(--primary);
            color: white;
            border: none;
            cursor: pointer;
            padding: 0.625rem 1.25rem;
            border-radius: var(--radius-md);
            font-weight: 500;
            font-family: inherit;
            transition: all var(--transition-fast);
          }
          
          .btn-primary:hover:not(:disabled) {
            background-color: var(--primary-dark);
            box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2), 0 2px 4px -1px rgba(13, 148, 136, 0.1);
          }
          
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .input-field {
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-medium);
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            color: var(--text-primary);
            font-family: inherit;
            transition: all var(--transition-fast);
          }
          .input-field:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-light);
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

          /* Modal Styles */
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
            z-index: 1000; display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.2s ease;
          }
          
          .modal-content.profile-modal {
            background-color: white; border-radius: var(--radius-lg);
            width: 100%; max-width: 500px;
            display: flex; flex-direction: column; box-shadow: var(--shadow-xl);
          }
          
          .modal-header {
            padding: 1.5rem; border-bottom: 1px solid var(--border-light);
            display: flex; align-items: center; justify-content: space-between;
          }
          
          .modal-header h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
          
          .modal-body {
            padding: 1.5rem;
          }
          
          .profile-hero {
            display: flex; flex-direction: column; align-items: center; text-align: center;
            margin-bottom: 2rem;
          }
          
          .profile-avatar-large {
            width: 80px; height: 80px; border-radius: 50%;
            background-color: var(--primary-light); color: var(--primary);
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; font-weight: 600; margin-bottom: 1rem;
          }
          
          .profile-hero h2 {
            margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--text-primary);
          }
          
          .role-badge {
            display: inline-block; padding: 0.25rem 0.75rem;
            background-color: #F1F5F9; border: 1px solid #E2E8F0;
            border-radius: 1rem; font-size: 0.75rem; font-weight: 600; color: #475569;
          }
          
          .profile-details-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
            background-color: #FAFCFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);
          }
          
          .detail-group label {
            display: block; font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.25rem;
          }
          
          .detail-group p {
            margin: 0; font-size: 0.875rem; color: var(--text-primary); font-weight: 500;
          }
          
          .status-active { color: var(--success) !important; font-weight: 600 !important; }

          .modal-footer {
            padding: 1.5rem; border-top: 1px solid var(--border-light);
            display: flex; justify-content: flex-end; gap: 1rem;
            background-color: #FAFCFF; border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg);
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
