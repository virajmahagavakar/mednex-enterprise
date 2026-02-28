import { useState, useEffect } from 'react';
import type { RoleResponse, StaffResponse, BranchResponse, StaffRegistrationRequest } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';
import { Plus, Search, Shield, Building2, X } from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<StaffRegistrationRequest>({
    name: '', email: '', password: '', roleIds: [], branches: [], primaryBranchId: '',
    profileDetails: { nationalIdNumber: '', residentialAddress: '', specialization: '', medicalLicenseNumber: '' }
  });

  useEffect(() => {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Staff & Roles Management</h2>
          <p className="page-description">Manage hospital personnel, roles, and branch assignments</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }} onClick={() => setIsModalOpen(true)}>
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
          <select className="select-filter">
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select className="select-filter">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ONLEAVE">On Leave</option>
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
              {staff.map(person => (
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
                      {person.roles.map(role => (
                        <span key={role.id} className="role-tag">
                          <Shield size={12} />
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="branch-info">
                      <Building2 size={16} color="var(--text-tertiary)" />
                      <span>City Central</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-dot ${person.status.toLowerCase()}`}>
                      {person.status}
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
            <form onSubmit={handleOnboardStaff}>
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
                  <div className="input-row">
                    <div className="input-group">
                      <label>Primary Branch *</label>
                      <select required className="input-field" value={formData.primaryBranchId} onChange={e => setFormData({ ...formData, primaryBranchId: e.target.value, branches: [e.target.value] })}>
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Assign Roles *</label>
                    <div className="role-checkboxes">
                      {roles.map(role => (
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
                      <label>Specialization</label>
                      <input type="text" className="input-field" placeholder="e.g. Cardiology" value={formData.profileDetails?.specialization} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, specialization: e.target.value } })} />
                    </div>
                    <div className="input-group">
                      <label>Medical License No.</label>
                      <input type="text" className="input-field" value={formData.profileDetails?.medicalLicenseNumber} onChange={e => setFormData({ ...formData, profileDetails: { ...formData.profileDetails!, medicalLicenseNumber: e.target.value } })} />
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
          .form-section { display: flex; flex-direction: column; gap: 1rem; }
          .section-title {
            font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px;
            color: var(--text-secondary); margin: 0 0 0.5rem 0;
            border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;
          }
          .role-checkboxes { display: flex; flex-wrap: wrap; gap: 0.75rem; }
          .role-checkbox-label { cursor: pointer; }
          .role-checkbox-label input[type="checkbox"] { display: none; }
          .role-card-content {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem;
            border: 1px solid var(--border); border-radius: var(--radius-md);
            transition: all var(--transition-fast); color: var(--text-secondary);
            font-weight: 500; font-size: 0.875rem;
          }
          .role-checkbox-label input[type="checkbox"]:checked + .role-card-content {
            border-color: var(--primary); background-color: var(--primary-light);
            color: var(--primary); box-shadow: 0 0 0 1px var(--primary);
          }

          /* Reusing page-container, page-header, page-title, page-description, card, toolbar, search-bar, etc from Branches.tsx */
          
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
            border: 1px solid var(--border);
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

          .status-dot {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .status-dot::before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .status-dot.active::before {
            background-color: var(--success);
          }

          .status-dot.onleave::before {
            background-color: var(--warning);
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
