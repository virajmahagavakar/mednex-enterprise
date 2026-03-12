import { useState, useEffect } from 'react';
import type { RoleResponse, StaffResponse, BranchResponse, StaffRegistrationRequest } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';
import { Plus, Search, Shield, X } from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<StaffRegistrationRequest>({
    name: '', email: '', password: '', roleIds: [], branches: [], primaryBranchId: '',
    profileDetails: { nationalIdNumber: '', residentialAddress: '', qualification: '', specialization: '', medicalLicenseNumber: '', yearsOfExperience: undefined, defaultConsultationFee: undefined }
  });

  const [userRole, setUserRole] = useState<string>('');
  const [userBranchId, setUserBranchId] = useState<string>('');

  useEffect(() => {
    const token = TokenService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const roles = typeof decoded.role === 'string' ? [decoded.role] : (decoded.role || []);
        if (roles.includes('HOSPITAL_ADMIN') || roles.includes('ADMIN')) setUserRole('HOSPITAL_ADMIN'); // ADMIN treated as HOSPITAL_ADMIN for UI
        else if (roles.includes('BRANCH_ADMIN')) setUserRole('BRANCH_ADMIN');

        if (decoded.branchId) {
          setUserBranchId(decoded.branchId);
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffData, rolesData, branchesData] = await Promise.all([
        AdminService.getStaff(), AdminService.getRoles(), AdminService.getBranches()
      ]);
      setStaff(staffData);
      setRoles(rolesData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Failed to fetch staff data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newStaff = await AdminService.onboardStaff(formData);
      setStaff([...staff, newStaff]);
      setIsModalOpen(false);
      setFormData({
        name: '', email: '', password: '', roleIds: [], branches: [], primaryBranchId: '',
        profileDetails: { nationalIdNumber: '', residentialAddress: '', specialization: '', medicalLicenseNumber: '' }
      });
    } catch (error) {
      console.error("Failed to onboard staff", error);
      alert("Failed to onboard staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const updatedRoles = formData.roleIds.includes(roleId)
      ? formData.roleIds.filter(id => id !== roleId)
      : [...formData.roleIds, roleId];
    setFormData({ ...formData, roleIds: updatedRoles });
  };

  const openModal = () => {
    setFormData({
      name: '', email: '', password: '', roleIds: [], branches: userRole === 'BRANCH_ADMIN' ? [userBranchId] : [],
      primaryBranchId: userRole === 'BRANCH_ADMIN' ? userBranchId : '',
      profileDetails: { nationalIdNumber: '', residentialAddress: '', qualification: '', specialization: '', medicalLicenseNumber: '', yearsOfExperience: undefined, defaultConsultationFee: undefined }
    });
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Staff & Roles Management</h2>
          <p className="page-description">Manage hospital personnel, roles, and branch assignments</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }} onClick={openModal}>
          <Plus size={18} />
          Onboard Staff
        </button>
      </div>

      <div className="card toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search staff by name or email..." className="search-input" />
        </div>

        <div className="toolbar-filters">
          <select className="select-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <select className="select-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading staff directory...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name & Contact</th>
                <th>Roles & Access</th>
                <th>Primary Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff
                .filter(person => !person.roles?.some(role => role.includes('ADMIN')))
                .filter(person => !roleFilter || person.roles?.includes(roleFilter))
                .filter(person => {
                    if (!statusFilter) return true;
                    if (statusFilter === 'ACTIVE') return person.active;
                    if (statusFilter === 'INACTIVE') return !person.active;
                    return true;
                })
                .map(person => (
                  <tr key={person.id}>
                    <td>
                      <div className="person-info">
                        <div className="avatar-sm">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <div className="person-name">{person.name}</div>
                          <div className="person-email">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-tags">
                        {person.roles?.map((role, idx) => (
                          <span key={idx} className="role-tag">
                            <Shield size={12} />
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="branch-info">
                        {person.primaryBranchId ? (
                          <span>{branches.find(b => b.id === person.primaryBranchId)?.name || 'Unknown Branch'}</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            Not assigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${person.active ? 'active' : 'inactive'}`}>
                        {person.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-link">Edit Profile</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Onboard New Staff Member</h3>
              <button type="button" className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleOnboardStaff} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-section">
                  <h4 className="section-title">Personal Details</h4>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Email Address *</label>
                      <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Temporary Password *</label>
                      <input type="password" required className="input-field" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>National ID Number *</label>
                      <input type="text" required className="input-field" value={formData.profileDetails?.nationalIdNumber} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, nationalIdNumber: e.target.value } })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Residential Address *</label>
                    <input type="text" required className="input-field" value={formData.profileDetails?.residentialAddress} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, residentialAddress: e.target.value } })} />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">Access & Assignments</h4>
                  {userRole !== 'BRANCH_ADMIN' && (
                    <div className="input-row">
                      <div className="input-group">
                        <label>Primary Branch *</label>
                        <select required className="input-field" value={formData.primaryBranchId} onChange={e => setFormData({ ...formData, primaryBranchId: e.target.value, branches: [e.target.value] })}>
                          <option value="">Select Branch</option>
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="input-group">
                    <label>Assign Roles *</label>
                    <div className="role-checkboxes">
                      {roles.filter(r => !r?.name?.includes('ADMIN')).map(role => (
                        <label key={role.id} className="role-checkbox-label">
                          <input type="checkbox" checked={formData.roleIds.includes(role.id)} onChange={() => handleRoleToggle(role.id)} />
                          <div className="role-card-content">
                            <Shield size={16} />
                            <span>{role.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">Clinical Profile (Optional)</h4>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Qualification *</label>
                      <input type="text" className="input-field" placeholder="e.g. MBBS, MD, B.Sc Nursing" value={formData.profileDetails?.qualification} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, qualification: e.target.value } })} />
                    </div>
                    <div className="input-group">
                      <label>Specialization</label>
                      <input type="text" className="input-field" placeholder="e.g. Cardiology" value={formData.profileDetails?.specialization} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, specialization: e.target.value } })} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Medical License No.</label>
                      <input type="text" className="input-field" value={formData.profileDetails?.medicalLicenseNumber} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, medicalLicenseNumber: e.target.value } })} />
                    </div>
                    <div className="input-group">
                      <label>Years of Experience *</label>
                      <input type="number" min="0" className="input-field" placeholder="e.g. 5" value={formData.profileDetails?.yearsOfExperience || ''} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, yearsOfExperience: parseInt(e.target.value) || undefined } })} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Default Consultation Fee (₹) *</label>
                      <input type="number" min="0" className="input-field" placeholder="e.g. 500" value={formData.profileDetails?.defaultConsultationFee || ''} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, defaultConsultationFee: parseInt(e.target.value) || undefined } })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || formData.roleIds.length === 0}>
                  {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          /* Modal Styles */
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
            z-index: 50; display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.2s ease;
          }
          .modal-content {
            background-color: white; border-radius: var(--radius-lg);
            width: 100%; max-width: 650px; max-height: 90vh;
            display: flex; flex-direction: column; box-shadow: var(--shadow-xl);
            animation: slideUp 0.3s ease;
          }
          .modal-header {
            padding: 1.5rem; border-bottom: 1px solid var(--border-light);
            display: flex; align-items: center; justify-content: space-between;
          }
          .modal-header h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
          .modal-body {
            padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 2rem;
          }
          .modal-footer {
            padding: 1.5rem; border-top: 1px solid var(--border-light);
            display: flex; justify-content: flex-end; gap: 1rem;
            background-color: #FAFCFF; border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg);
          }
          .form-section {
            margin-bottom: 1.5rem;
            display: flex; flex-direction: column; gap: 1rem;
          }
          .section-title {
            font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;
            letter-spacing: 0.5px; font-weight: 600; margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;
          }
          .input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .role-checkboxes {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 0.75rem;
          }
          .role-checkbox-label {
            cursor: pointer;
          }
          .role-checkbox-label input[type="checkbox"] { display: none; }
          .role-card-content {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem;
            border: 1px solid var(--border); border-radius: var(--radius-md);
            transition: all var(--transition-fast); color: var(--text-secondary);
            font-weight: 500; font-size: 0.875rem;
          }
          .role-checkbox-label:hover .role-card-content {
            background-color: var(--bg-main);
            border-color: var(--primary-light);
          }
          .role-checkbox-label input[type="checkbox"]:checked + .role-card-content {
            border-color: var(--primary); background-color: var(--primary-light);
            color: var(--primary); box-shadow: 0 0 0 1px var(--primary);
          }

          /* Reused from Branches.tsx */
          .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
          .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }
          .page-description { color: var(--text-secondary); font-size: 0.875rem; }
          .card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
          .toolbar { padding: 1rem; display: flex; gap: 1rem; justify-content: space-between; align-items: center; }
          .search-bar { flex: 1; position: relative; max-width: 400px; }
          .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); }
          .search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid #9CA3AF; border-radius: var(--radius-md); font-family: inherit; transition: all var(--transition-fast); }
          .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }

          .input-field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #9CA3AF; border-radius: var(--radius-md); font-family: inherit; transition: all var(--transition-fast); background-color: var(--bg-surface); }
          .input-field:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
          
          .toolbar {
            justify-content: space-between;
            align-items: center;
          }

          .toolbar-filters {
            display: flex;
            gap: 1rem;
          }

          .select-filter {
            padding: 0.625rem 2rem 0.625rem 1rem;
            border: 1px solid #9CA3AF;
            border-radius: var(--radius-md);
            font-family: inherit;
            background-color: white;
            color: var(--text-primary);
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1em;
          }

          .table-container {
            overflow-x: auto;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table th {
            text-align: left;
            padding: 1rem 1.5rem;
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.875rem;
            border-bottom: 2px solid var(--border-light);
            background-color: #FAFCFF;
          }

          .data-table td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-light);
            vertical-align: middle;
          }

          .data-table tr:last-child td {
            border-bottom: none;
          }

          .data-table tr:hover td {
            background-color: #FAFCFF;
          }

          .person-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .avatar-sm {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--primary-light);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
          }

          .person-name {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.125rem;
          }

          .person-email {
            font-size: 0.875rem;
            color: var(--text-tertiary);
          }

          .role-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .role-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            background-color: var(--bg-main);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-secondary);
          }

          .branch-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background-color: var(--bg-main);
            color: var(--text-secondary);
            border: 1px solid var(--border);
          }
          
          .status-badge.active {
            background-color: var(--success-bg);
            color: var(--success);
            border-color: #BBF7D0;
          }
          
          .status-badge.inactive, .status-badge.unknown {
            background-color: var(--warning-bg);
            color: var(--warning);
            border-color: #FEF08A;
          }

          .btn-link {
            color: var(--primary);
            font-weight: 500;
            font-size: 0.875rem;
          }
          
          .btn-link:hover {
            text-decoration: underline;
          }
          
        `}
      </style>
    </div>
  );
};

export default Staff;
