import React, { useState, useEffect } from 'react';
import TheatreBedMap from '../../components/infrastructure/TheatreBedMap';
import InfrastructureService from '../../services/InfrastructureService';
import type { WardDTO } from '../../services/api.types';
import '../../styles/enterprise-components.css';
import { LayoutDashboard, Map as MapIcon, Filter } from 'lucide-react';

const WardAvailability: React.FC = () => {
    const [wards, setWards] = useState<WardDTO[]>([]);
    const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWards = async () => {
            try {
                // Assuming branchId is stored in localStorage or context
                const branchId = localStorage.getItem('branchId') || ''; 
                // Fallback for demo if branchId not set
                const response = await InfrastructureService.getWards(branchId);
                setWards(response);
                if (response.length > 0) {
                    setSelectedWardId(response[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch wards', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWards();
    }, []);

    return (
        <div className="enterprise-page">
            <div className="enterprise-header">
                <div>
                    <h1>
                        <MapIcon className="text-primary" size={32} />
                        Ward Availability Matrix
                    </h1>
                    <p>Real-time bed tracking and infrastructure management</p>
                </div>
                
                <div className="flex-container" style={{ gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <select 
                            className="enterprise-select"
                            value={selectedWardId || ''}
                            onChange={(e) => setSelectedWardId(e.target.value)}
                            style={{ paddingRight: '2.5rem' }}
                        >
                            {wards.map(ward => (
                                <option key={ward.id} value={ward.id}>{ward.name}</option>
                            ))}
                        </select>
                        <Filter style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} size={18} />
                    </div>
                </div>
            </div>

            <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0.25rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.25rem' }}>
                    <button className="btn-secondary" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                        Visual Matrix
                    </button>
                    <button className="link-btn" style={{ padding: '0.5rem 1rem' }}>
                        List View
                    </button>
                    <button className="link-btn" style={{ padding: '0.5rem 1rem' }}>
                        Analytics
                    </button>
                </div>

                <div className="enterprise-card-content" style={{ padding: 0 }}>
                    {selectedWardId ? (
                        <TheatreBedMap wardId={selectedWardId} />
                    ) : (
                        <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            {loading ? 'Initializing Matrix...' : 'No Wards Found'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardAvailability;
