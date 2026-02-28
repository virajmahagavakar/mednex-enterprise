import { useState, useEffect } from 'react';
import type { BranchResponse } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';
import { Building2, Plus, Search, MapPin, MoreVertical } from 'lucide-react';

const Branches = () => {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Branch Management</h2>
          <p className="page-description">Manage your hospital branches and facilities</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }}>
          <Plus size={18} />
          Add Branch
        </button>
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
                  <span className={`status-badge ${branch.status.toLowerCase()}`}>
                    {branch.status}
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
                <button className="btn-outline">Manage Staff</button>
                <button className="btn-outline">View Details</button>
              </div>
            </div>
          ))}
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
        `}
      </style>
    </div>
  );
};

export default Branches;
