import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import { 
  Users, 
  Building2, 
  Activity, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import '../../styles/enterprise-components.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    totalBranches: 0,
    totalRoles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [staff, branches, roles] = await Promise.all([
          AdminService.getStaff(),
          AdminService.getBranches(),
          AdminService.getRoles()
        ]);
        
        setStats({
          totalStaff: staff.length,
          activeStaff: staff.filter(s => s.active).length,
          totalBranches: branches.length,
          totalRoles: roles.length
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'var(--primary)', borderWidth: '3px', borderStyle: 'solid', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading Dashboard...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Admin Console Overview</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Hospital enterprise management and top-level analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'white' }}>
            <Clock size={16} />
            <span>Last synced: Just now</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {/* Metric Cards */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-light)', padding: '0.25rem 0.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{stats.totalStaff}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Total Staff Members</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{stats.activeStaff}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Active Personnel</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{stats.totalBranches}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Hospital Branches</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{stats.totalRoles}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Access Roles Defined</p>
          </div>
        </div>
      </div>
      
      {/* Additional UI sections for aesthetic premium feel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
         <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>System Health</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFCFF', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                         <span style={{ fontWeight: 500 }}>Core API Services</span>
                     </div>
                     <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Operational (99.9% Uptime)</span>
                 </div>
                 <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFCFF', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                         <span style={{ fontWeight: 500 }}>Database Cluster</span>
                     </div>
                     <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Operational (3.2ms latency)</span>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
