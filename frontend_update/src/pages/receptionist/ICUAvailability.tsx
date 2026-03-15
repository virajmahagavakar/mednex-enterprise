import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, Search, Filter } from 'lucide-react';
import { ReceptionistService } from '../../services/receptionist.service';
import type { WardDTO, BedDTO } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';

const ICUAvailability: React.FC = () => {
    const [wards, setWards] = useState<WardDTO[]>([]);
    const [icuBeds, setIcuBeds] = useState<{ ward: string; beds: BedDTO[] }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });

    useEffect(() => {
        loadIcuData();
    }, []);

    const loadIcuData = async () => {
        setIsLoading(true);
        try {
            // First get current staff profile to find their branch
            const profile = await AdminService.getCurrentProfile();
            const branchId = profile.branch?.id;

            if (!branchId) {
                console.error("No branch ID found for current user");
                return;
            }

            // Fetch wards and filter for ICU
            const allWards = await ReceptionistService.getWardsByBranch(branchId);
            const filteredIcuWards = allWards.filter(w => 
                w.name.toUpperCase().includes('ICU') || 
                w.name.toUpperCase().includes('INTENSIVE')
            );
            
            setWards(filteredIcuWards);

            // Fetch beds for each ICU ward
            const bedsPromises = filteredIcuWards.map(async (ward) => {
                const beds = await ReceptionistService.getBedsByWard(ward.id);
                return { ward: ward.name, beds };
            });

            const results = await Promise.all(bedsPromises);
            setIcuBeds(results);

            // Calculate stats
            let total = 0;
            let occupied = 0;
            results.forEach(res => {
                total += res.beds.length;
                occupied += res.beds.filter(b => b.status === 'OCCUPIED').length;
            });
            setStats({ total, occupied, available: total - occupied });

        } catch (error) {
            console.error("Failed to load ICU data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">ICU Availability</h1>
                    <p className="page-description">Real-time status of critical care beds and monitors.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="status-badge-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', gap: '0.5rem', border: '1px solid var(--danger)' }}>
                        <AlertTriangle size={14} />
                        Critical: {stats.available <= 2 ? 'Low Capacity' : 'Stable'}
                    </div>
                    <button className="btn-secondary" onClick={loadIcuData} title="Refresh Data">
                        <Activity size={18} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total ICU Beds</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Occupied</span>
                        <span className="stat-value">{stats.occupied}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                        <BedDoubleIcon size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Available Now</span>
                        <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.available}</span>
                    </div>
                </div>
            </div>

            {/* ICU Wards Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {isLoading ? (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="animate-pulse" style={{ color: 'var(--text-tertiary)' }}>Fetching ICU real-time telemetry...</div>
                    </div>
                ) : icuBeds.length === 0 ? (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>No ICU Wards configured for this branch.</div>
                        <p style={{ color: 'var(--text-tertiary)' }}>Please contact hospital administration to set up Critical Care units.</p>
                    </div>
                ) : (
                    icuBeds.map((icu, index) => (
                        <div key={index} className="card">
                            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F5F9' }}>
                                <h3 style={{ gap: '0.75rem' }}>
                                    <Shield size={20} style={{ color: 'var(--danger)' }} />
                                    {icu.ward}
                                </h3>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {icu.beds.filter(b => b.status === 'AVAILABLE').length} Available / {icu.beds.length} Total
                                </div>
                            </div>
                            <div className="panel-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                    {icu.beds.map(bed => {
                                        const isAvailable = bed.status === 'AVAILABLE';
                                        return (
                                            <div key={bed.id} style={{
                                                padding: '1.25rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${isAvailable ? 'var(--success)' : 'var(--border)'}`,
                                                backgroundColor: isAvailable ? 'var(--success-bg)' : 'var(--bg-main)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                opacity: bed.status === 'MAINTENANCE' ? 0.6 : 1,
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {!isAvailable && (
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: 0, 
                                                        left: 0, 
                                                        width: '100%', 
                                                        height: '4px', 
                                                        backgroundColor: bed.status === 'OCCUPIED' ? 'var(--danger)' : 'var(--warning)' 
                                                    }} />
                                                )}
                                                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{bed.bedNumber}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>UNIT {bed.roomNumber}</div>
                                                <div style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 700, 
                                                    textTransform: 'uppercase', 
                                                    color: isAvailable ? 'var(--success)' : (bed.status === 'OCCUPIED' ? 'var(--danger)' : 'var(--warning)')
                                                }}>
                                                    {bed.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Helper icon
const BedDoubleIcon = ({ size, className }: { size?: number; className?: string }) => (
    <svg 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
        <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <path d="M12 4v6" />
        <path d="M2 18h20" />
    </svg>
);

export default ICUAvailability;
