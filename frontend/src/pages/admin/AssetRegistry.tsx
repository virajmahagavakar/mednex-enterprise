import React, { useState, useEffect } from 'react';
import InfrastructureService from '../../services/InfrastructureService';
import type { MedicalAssetDTO } from '../../services/api.types';
import '../../styles/enterprise-components.css';
import { 
    Search, 
    Filter, 
    Plus, 
    Monitor, 
    MoreVertical, 
    Activity, 
    Wrench, 
    Calendar,
    Settings
} from 'lucide-react';

const AssetRegistry: React.FC = () => {
    const [assets, setAssets] = useState<MedicalAssetDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Mock data for initial view
        setAssets([
            {
                id: '1',
                name: 'Mindray Ventilator V60',
                assetType: 'VENTILATOR',
                serialNumber: 'MV-9982-X',
                manufacturer: 'Mindray',
                purchaseDate: '2023-01-15',
                status: 'IN_USE',
                currentLocationType: 'BED',
                currentLocationId: 'bed-101'
            },
            {
                id: '2',
                name: 'Philips Patient Monitor',
                assetType: 'MONITOR',
                serialNumber: 'PH-0012-P',
                manufacturer: 'Philips',
                purchaseDate: '2023-05-20',
                status: 'AVAILABLE',
                currentLocationType: 'STORAGE',
                currentLocationId: 'main-storage'
            }
        ]);
        setLoading(false);
    }, []);

    const filteredAssets = assets.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="enterprise-page">
            <div className="enterprise-header">
                <div>
                    <h1>
                        <Monitor className="text-primary" size={32} />
                        Biomedical Asset Registry
                    </h1>
                    <p>Lifecycle tracking and maintenance management for medical equipment</p>
                </div>
                
                <button className="btn-primary">
                    <Plus size={20} />
                    Register New Asset
                </button>
            </div>

            <div className="enterprise-controls">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name or serial number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn-secondary">
                    <Filter size={20} />
                    Filters
                </button>
            </div>

            <div className="enterprise-grid">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="enterprise-card">
                        <div className="enterprise-card-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div className={`enterprise-badge ${getStatusClass(asset.status)}`}>
                                    {asset.status.replace('_', ' ')}
                                </div>
                                <button className="icon-btn">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            
                            <h3 style={{ marginBottom: '0.25rem' }}>{asset.name}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginBottom: '1.25rem' }}>{asset.serialNumber}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                    <Calendar size={16} color="var(--text-tertiary)" />
                                    <span>Purchased: {new Date(asset.purchaseDate || '').toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                    <Settings size={16} color="var(--text-tertiary)" />
                                    <span>Location: {asset.currentLocationType} ({asset.currentLocationId})</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="enterprise-card-footer">
                            <button className="btn-secondary btn-sm" style={{ flex: 1 }}>
                                <Wrench size={14} />
                                Maintenance
                            </button>
                            <button className="btn-secondary btn-sm" title="Configure">
                                <Settings size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredAssets.length === 0 && (
                <div className="empty-state" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                    <Monitor size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No assets found matching your criteria</p>
                </div>
            )}
        </div>
    );
};

const getStatusClass = (status: string) => {
    switch(status) {
        case 'IN_USE': return 'status-in-use';
        case 'AVAILABLE': return 'status-available';
        case 'UNDER_MAINTENANCE': return 'status-maintenance';
        default: return '';
    }
}

export default AssetRegistry;
