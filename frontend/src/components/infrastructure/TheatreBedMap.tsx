import React, { useState, useEffect } from 'react';
import './TheatreBedMap.css';
import InfrastructureService from '../../services/InfrastructureService';
import type { WardMapDTO, BedDTO, BedStatus } from '../../services/api.types';
import '../../styles/enterprise-components.css';
import { Loader2, Info, Bed as BedIcon, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TheatreBedMapProps {
    wardId: string;
}

const TheatreBedMap: React.FC<TheatreBedMapProps> = ({ wardId }) => {
    const [wardMap, setWardMap] = useState<WardMapDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBed, setSelectedBed] = useState<BedDTO | null>(null);

    useEffect(() => {
        fetchWardMap();
    }, [wardId]);

    const fetchWardMap = async () => {
        try {
            setLoading(true);
            const response = await InfrastructureService.getWardMap(wardId);
            setWardMap(response);
            setError(null);
        } catch (err) {
            setError('Failed to load ward map data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBedClick = (bed: BedDTO) => {
        setSelectedBed(bed);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );
    if (error) return (
        <div style={{ padding: '2.5rem', color: 'var(--danger)', textAlign: 'center' }}>
            <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
            <p>{error}</p>
        </div>
    );
    if (!wardMap) return null;

    return (
        <div className="theatre-map-container" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <div className="map-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{wardMap.wardName}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{wardMap.wardType} Ward • Real-time Monitoring</p>
                </div>
                <div className="map-legend" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span className="status-dot available" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></span> Available
                    </div>
                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span className="status-dot occupied" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)' }}></span> Occupied
                    </div>
                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span className="status-dot reserved" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning)' }}></span> Reserved
                    </div>
                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span className="status-dot cleaning" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }}></span> Cleaning
                    </div>
                </div>
            </div>

            <div className="ward-grid">
                {wardMap.rooms.map(room => (
                    <div key={room.id} className="room-card">
                        <div className="room-header">
                            <span className="room-number">Room {room.roomNumber}</span>
                            <span className="room-type-badge">{room.roomType}</span>
                        </div>
                        <div className="bed-grid">
                            {room.beds.map(bed => (
                                <div 
                                    key={bed.id} 
                                    className={`bed-cell ${bed.status.toLowerCase()}`}
                                    onClick={() => handleBedClick(bed)}
                                >
                                    <BedIcon className="bed-icon" color={getStatusColor(bed.status)} />
                                    <span className="bed-label">Bed {bed.bedNumber}</span>
                                    {bed.patient && (
                                        <div className="patient-mini-info">
                                            {bed.patient.name}
                                        </div>
                                    )}
                                    {bed.attachedAssets && bed.attachedAssets.length > 0 && (
                                        <div className="asset-indicators">
                                            {bed.attachedAssets.map((asset, i) => (
                                                <div key={i} className="asset-icon" title={asset.name}></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedBed && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="enterprise-card" style={{ maxWidth: '450px', width: '100%', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Bed Details - {selectedBed.bedNumber}</h3>
                            <button onClick={() => setSelectedBed(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-tertiary)' }}>✕</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</p>
                                    <p style={{ fontWeight: 700, color: getStatusColor(selectedBed.status) }}>{selectedBed.status}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Type</p>
                                    <p style={{ fontWeight: 700 }}>{selectedBed.bedType}</p>
                                </div>
                            </div>

                            {selectedBed.patient ? (
                                <div style={{ border: '1px solid var(--success-light)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                                        <ShieldCheck size={18} />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Patient Admitted</span>
                                    </div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedBed.patient.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedBed.patient.diagnosis}</p>
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        <p>Dr. {selectedBed.patient.doctorName}</p>
                                        <p>Admitted: {new Date(selectedBed.patient.admissionDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                    <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.85rem' }}>No Patient Assigned</p>
                                </div>
                            )}

                            {selectedBed.attachedAssets && selectedBed.attachedAssets.length > 0 && (
                                <div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Medical Equipment</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {selectedBed.attachedAssets.map(asset => (
                                            <span key={asset.id} style={{ fontSize: '0.7rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                                {asset.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setSelectedBed(null)}
                                >
                                    Close
                                </button>
                                {selectedBed.status === 'AVAILABLE' ? (
                                    <button className="btn-primary" style={{ fontWeight: 800 }}>
                                        Admit Patient
                                    </button>
                                ) : (
                                    <button className="btn-secondary" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 800 }}>
                                        Transfer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusColor = (status: BedStatus) => {
    switch (status) {
        case 'AVAILABLE': return '#10b981';
        case 'OCCUPIED': return '#ef4444';
        case 'RESERVED': return '#f59e0b';
        case 'CLEANING_REQUIRED': return '#3b82f6';
        case 'MAINTENANCE': return '#6b7280';
        default: return '#6b7280';
    }
};

export default TheatreBedMap;
