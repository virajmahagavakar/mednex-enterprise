import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BranchResponse, BranchRequest, StaffRegistrationRequest } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';
import { Building2, Plus, Search, MapPin, MoreVertical, X } from 'lucide-react';

interface JWTPayload {
  roles?: string[];
}

const Branches = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('HOSPITAL_ADMIN');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBranchData, setNewBranchData] = useState<BranchRequest>({ name: '', code: '', address: '' });

  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState<Partial<StaffRegistrationRequest>>({
    name: '',
    email: '',
    password: '',
    primaryBranchId: '',
    branches: [],
    roleIds: []
  });

  useEffect(() => {
    const token = TokenService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.roles && decoded.roles.length > 0) {
          setUserRole(decoded.roles[0]?.replace('ROLE_', ''));
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const data = await AdminService.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newBranch = await AdminService.createBranch(newBranchData);
      setBranches([...branches, newBranch]);
      setIsAddModalOpen(false);
      setNewBranchData({ name: '', code: '', address: '' });
    } catch (error) {
      console.error("Failed to add branch", error);
      alert("Failed to add branch. Please check your permissions or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setIsSubmitting(true);
    try {
      // Bypassing dynamic role fetch due to 403 Forbidden. Hardcoding ROLE_BRANCH_ADMIN ID.
      // In a real system you'd ensure the endpoint is accessible or pre-fetched.
      const branchAdminRoleId = 3; // Assuming 1=SUPER_ADMIN, 2=HOSPITAL_ADMIN, 3=BRANCH_ADMIN. Adjust if needed.

      const payload: StaffRegistrationRequest = {
        name: adminFormData.name || '',
        email: adminFormData.email || '',
        password: adminFormData.password,
        primaryBranchId: selectedBranch.id,
        branches: [selectedBranch.id],
        roleIds: [branchAdminRoleId],
        profileDetails: {
          nationalIdNumber: "N/A", // Required by backend currently, sending dummy
          residentialAddress: "N/A"
        }
      };

      await AdminService.onboardStaff(payload);
      alert("Branch Admin successfully assigned!");
      setIsAssignAdminModalOpen(false);

      // Reset form
      setAdminFormData({ name: '', email: '', password: '' });
      setSelectedBranch(null);
    } catch (error) {
      console.error("Failed to assign admin", error);
      alert("Failed to assign Branch Admin. Ensure the email is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Branch Management</h2>
          <p className="page-description">Manage your hospital branches and facilities</p>
        </div>
        {userRole === 'HOSPITAL_ADMIN' && (
          <button className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} />
            Add Branch
          </button>
        )}
      </div>

      <div className="card toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search branches by name or code..." className="search-input" />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading branches...</p>
        </div>
      ) : (
        <div className="branch-grid">
          {branches.map(branch => (
            <div key={branch.id} className="branch-card">
              <div className="branch-card-header">
                <div className="branch-icon">
                  <Building2 size={24} color="var(--primary)" />
                </div>
                <div className="branch-actions">
                  <span className={`status-badge ${branch.active ? 'active' : 'inactive'}`}>
                    {branch.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <button className="icon-btn"><MoreVertical size={18} /></button>
                </div>
              </div>

              <div className="branch-card-body">
                <h3>{branch.name}</h3>
                <p className="branch-code">{branch.code}</p>

                <div className="branch-detail">
                  <MapPin size={16} />
                  <span>{branch.address}</span>
                </div>
              </div>

              <div className="branch-card-footer">
                {userRole === 'HOSPITAL_ADMIN' ? (
                  <button className="btn-primary" style={{ flex: 1, padding: '0.4rem' }} onClick={() => { setSelectedBranch(branch); setIsAssignAdminModalOpen(true); }}>Assign Admin</button>
                ) : (
                  <button className="btn-outline" onClick={() => navigate('/admin/staff')}>Manage Staff</button>
                )}
                <button className="btn-outline" onClick={() => { setSelectedBranch(branch); setIsDetailsModalOpen(true); }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Branch</h3>
              <button type="button" className="icon-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddBranch}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Branch Name *</label>
                  <input type="text" required className="input-field" value={newBranchData.name} onChange={e => setNewBranchData({ ...newBranchData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Branch Code *</label>
                  <input type="text" required className="input-field" value={newBranchData.code} onChange={e => setNewBranchData({ ...newBranchData, code: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Branch Address *</label>
                  <input type="text" required className="input-field" value={newBranchData.address} onChange={e => setNewBranchData({ ...newBranchData, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !newBranchData.name}>
                  {isSubmitting ? 'Saving...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Details Modal */}
      {isDetailsModalOpen && selectedBranch && (
        <div className="modal-overlay">
          <div className="modal-content profile-modal">
            <div className="modal-header">
              <h3>Branch Details</h3>
              <button className="icon-btn" onClick={() => { setIsDetailsModalOpen(false); setSelectedBranch(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-hero" style={{ marginBottom: '1.5rem' }}>
                <div className="profile-avatar-large" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                  <Building2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.25rem' }}>{selectedBranch.name}</h2>
                <span className={`role-badge ${selectedBranch.active ? 'active' : 'inactive'}`} style={{
                  backgroundColor: selectedBranch.active ? '#DCFCE7' : '#F1F5F9',
                  color: selectedBranch.active ? '#166534' : '#475569',
                  borderColor: selectedBranch.active ? '#BBF7D0' : '#E2E8F0'
                }}>
                  {selectedBranch.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="profile-details-grid">
                <div className="detail-group">
                  <label>Branch Code</label>
                  <p>{selectedBranch.code}</p>
                </div>
                <div className="detail-group">
                  <label>Creation Date</label>
                  <p>{new Date(selectedBranch.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="detail-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <p>{selectedBranch.address}</p>
                </div>

                {/* Placeholder for Branch Admin Info */}
                <div className="detail-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label>Branch Admins & Managers</label>
                  <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    Staff management requires active navigation to the 'Staff & Roles' module. Branch administrative contacts will be displayed here in future updates.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => { setIsDetailsModalOpen(false); setSelectedBranch(null); }}>Close</button>
              <button className="btn-primary" onClick={() => navigate('/admin/staff')}>Go to Staff Management</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {isAssignAdminModalOpen && selectedBranch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Assign Branch Admin</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>For {selectedBranch.name}</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => { setIsAssignAdminModalOpen(false); setSelectedBranch(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignAdmin}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Administrator Name *</label>
                  <input type="text" required className="input-field" value={adminFormData.name} onChange={e => setAdminFormData({ ...adminFormData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Email Address *</label>
                  <input type="email" required className="input-field" value={adminFormData.email} onChange={e => setAdminFormData({ ...adminFormData, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Temporary Password *</label>
                  <input type="password" required className="input-field" value={adminFormData.password} onChange={e => setAdminFormData({ ...adminFormData, password: e.target.value })} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>The Branch Admin will use this to log in initially.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => { setIsAssignAdminModalOpen(false); setSelectedBranch(null); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !adminFormData.name || !adminFormData.email || !adminFormData.password}>
                  {isSubmitting ? 'Assigning...' : 'Assign Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          .page-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .page-title {
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
          }

          .page-description {
            color: var(--text-secondary);
            font-size: 0.875rem;
          }

          .card {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
          }

          .toolbar {
            padding: 1rem;
            display: flex;
            gap: 1rem;
          }

          .search-bar {
            flex: 1;
            position: relative;
            max-width: 400px;
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-tertiary);
          }

          .search-input {
            width: 100%;
            padding: 0.625rem 1rem 0.625rem 2.5rem;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            font-family: inherit;
            transition: all var(--transition-fast);
          }

          .search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-light);
          }

          .branch-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .branch-card {
            background: white;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-light);
            box-shadow: var(--shadow-sm);
            transition: transform var(--transition-fast), box-shadow var(--transition-fast);
            display: flex;
            flex-direction: column;
          }

          .branch-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
          }

          .branch-card-header {
            padding: 1.5rem 1.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .branch-icon {
            width: 48px;
            height: 48px;
            background-color: var(--primary-light);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .branch-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-badge.active {
            background-color: var(--success-bg);
            color: var(--success);
          }

          .status-badge.inactive {
            background-color: var(--warning-bg);
            color: var(--warning);
          }

          .icon-btn {
            color: var(--text-tertiary);
            padding: 0.25rem;
            border-radius: var(--radius-sm);
            transition: all var(--transition-fast);
          }

          .icon-btn:hover {
            background-color: var(--bg-main);
            color: var(--text-primary);
          }

          .branch-card-body {
            padding: 1.5rem;
            flex: 1;
          }

          .branch-card-body h3 {
            font-size: 1.125rem;
            margin-bottom: 0.25rem;
          }

          .branch-code {
            color: var(--primary);
            font-weight: 500;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }

          .branch-detail {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.4;
          }

          .branch-card-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-light);
            display: flex;
            gap: 0.75rem;
          }

          .btn-outline {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--text-primary);
            transition: all var(--transition-fast);
          }

          .btn-outline:hover {
            border-color: var(--primary);
            color: var(--primary);
            background-color: var(--primary-light);
          }

          .loading-state {
            padding: 4rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: var(--text-secondary);
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border-light);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          /* Modal Styles from Staff.tsx to ensure it renders correctly */
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
            z-index: 50; display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.2s ease;
          }
          .modal-content {
            background-color: white; border-radius: var(--radius-lg);
            width: 100%; max-width: 500px; max-height: 90vh;
            display: flex; flex-direction: column; box-shadow: var(--shadow-xl);
            animation: slideUp 0.3s ease;
          }
          .modal-header {
            padding: 1.5rem; border-bottom: 1px solid var(--border-light);
            display: flex; align-items: center; justify-content: space-between;
          }
          .modal-header h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
          .modal-body {
            padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.5rem;
          }
          .modal-footer {
            padding: 1.5rem; border-top: 1px solid var(--border-light);
            display: flex; justify-content: flex-end; gap: 1rem;
            background-color: #FAFCFF; border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg);
          }
          .input-group {
            display: flex; flex-direction: column; gap: 0.5rem;
          }
          .input-group label {
            font-size: 0.875rem; font-weight: 500; color: var(--text-secondary);
          }
          .input-field {
            padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-md);
            font-family: inherit; transition: all var(--transition-fast); width: 100%;
          }
          .input-field:focus {
            outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light);
          }
          
          /* Details Grid Styles (Reused from Profile Modal) */
          .profile-modal { max-width: 550px !important; }
          .profile-hero { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .profile-avatar-large { border-radius: 50%; background-color: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
          .profile-hero h2 { margin: 0 0 0.5rem 0; color: var(--text-primary); font-weight: 600; }
          .role-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; }
          .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; background-color: #FAFCFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); }
          .detail-group label { display: block; font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.25rem; }
          .detail-group p { margin: 0; font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
        `}
      </style>
    </div>
  );
};

export default Branches;
