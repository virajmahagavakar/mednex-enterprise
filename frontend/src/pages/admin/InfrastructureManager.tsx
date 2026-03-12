import React, { useState, useEffect } from 'react';
import InfrastructureService from '../../services/InfrastructureService';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';
import { AdminService } from '../../services/admin.service';
import type { BuildingDTO, FloorDTO } from '../../services/api.types';
import '../../styles/enterprise-components.css';
import { 
    Plus, 
    ChevronRight, 
    Building as BuildingIcon, 
    Layers, 
    DoorOpen, 
    Layout, 
    CheckCircle2, 
    AlertCircle,
    X
} from 'lucide-react';

const InfrastructureManager: React.FC = () => {
    const [buildings, setBuildings] = useState<BuildingDTO[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingDTO | null>(null);
    const [floors, setFloors] = useState<FloorDTO[]>([]);
    const [selectedFloor, setSelectedFloor] = useState<FloorDTO | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Modal state for rooms/wards
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRoomData, setNewRoomData] = useState<{roomNumber: string, roomType: 'GENERAL' | 'SEMI_PRIVATE' | 'PRIVATE' | 'ICU' | 'THEATRE' | 'EMERGENCY' | 'LAB' | 'RADIOLOGY' | 'CONSULTATION', totalBeds: number}>({
        roomNumber: '',
        roomType: 'GENERAL',
        totalBeds: 10
    });

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const token = TokenService.getToken();
            let branchId = '';
            if (token) {
                const decoded: any = jwtDecode(token);
                branchId = decoded.primaryBranchId || decoded.branchId || decoded.hospital_id || '';
            }
            if (!branchId || !branchId.includes('-')) {
                const branches = await AdminService.getBranches();
                if (branches.length > 0) {
                    branchId = branches[0].id;
                }
            }
            if (!branchId) {
                console.warn('No branchId found in token, and no branches available');
                return;
            }
            localStorage.setItem('branchId', branchId);
            const data = await InfrastructureService.getBuildings(branchId);
            setBuildings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectBuilding = async (building: BuildingDTO) => {
        setSelectedBuilding(building);
        setSelectedFloor(null);
        try {
            setLoading(true);
            const data = await InfrastructureService.getFloors(building.id);
            setFloors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBuilding = async () => {
        const name = prompt('Building Name:');
        if (!name) return;
        try {
            const token = TokenService.getToken();
            let branchId = '';
            if (token) {
                const decoded: any = jwtDecode(token);
                branchId = decoded.primaryBranchId || decoded.branchId || decoded.hospital_id || '';
            }
            if (!branchId || !branchId.includes('-')) {
                branchId = localStorage.getItem('branchId') || '';
                if (!branchId) {
                    setMessage({ text: 'Ensure you have a branch setup first', type: 'error' });
                    return;
                }
            }
            await InfrastructureService.createBuilding({ name, branchId });
            setMessage({ text: 'Building created successfully', type: 'success' });
            fetchBuildings();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ text: 'Failed to create building', type: 'error' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleAddFloor = async () => {
        if (!selectedBuilding) return;
        const num = prompt('Floor Number:');
        const name = prompt('Floor Display Name (Optional):');
        if (!num) return;
        try {
            await InfrastructureService.createFloor({ 
                buildingId: selectedBuilding.id, 
                floorNumber: parseInt(num), 
                name: name || `Floor ${num}` 
            });
            handleSelectBuilding(selectedBuilding);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFloor) return;
        setIsSubmitting(true);
        try {
            await InfrastructureService.createRoom({
                floorId: selectedFloor.id,
                roomNumber: newRoomData.roomNumber,
                roomType: newRoomData.roomType as any,
                totalBeds: newRoomData.totalBeds
            });
            setMessage({ text: 'Room created successfully', type: 'success' });
            setIsRoomModalOpen(false);
            setNewRoomData({ roomNumber: '', roomType: 'GENERAL', totalBeds: 10 });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Failed to create room", err);
            setMessage({ text: 'Failed to create room', type: 'error' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="enterprise-page">
            <div className="enterprise-header" style={{ textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <h1>Hospital Hierarchy Designer</h1>
                <p>Design your hospital infrastructure from buildings down to beds</p>
            </div>

            {message && (
                <div className={`enterprise-badge ${message.type === 'success' ? 'status-available' : 'status-maintenance'}`} 
                     style={{ margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content', padding: '0.75rem 1.5rem' }}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="hierarchy-container">
                {/* Column 1: Buildings */}
                <div className="hierarchy-column">
                    <div className="hierarchy-column-header">
                        <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BuildingIcon size={20} className="text-primary" /> 
                            Buildings
                        </h2>
                        <button onClick={handleAddBuilding} className="icon-btn">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="hierarchy-list">
                        {buildings.map(b => (
                            <div 
                                key={b.id} 
                                onClick={() => handleSelectBuilding(b)}
                                className={`hierarchy-item ${selectedBuilding?.id === b.id ? 'active' : ''}`}
                            >
                                <span style={{ fontWeight: 500 }}>{b.name}</span>
                                <ChevronRight size={18} style={{ opacity: selectedBuilding?.id === b.id ? 1 : 0.3 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Floors */}
                <div className="hierarchy-column" style={{ opacity: !selectedBuilding ? 0.4 : 1, pointerEvents: !selectedBuilding ? 'none' : 'auto' }}>
                    <div className="hierarchy-column-header">
                        <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={20} className="text-primary" /> 
                            Floors
                        </h2>
                        <button onClick={handleAddFloor} className="icon-btn">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="hierarchy-list">
                        {floors.map(f => (
                            <div 
                                key={f.id} 
                                onClick={() => setSelectedFloor(f)}
                                className={`hierarchy-item ${selectedFloor?.id === f.id ? 'active' : ''}`}
                            >
                                <span style={{ fontWeight: 500 }}>{f.name}</span>
                                <ChevronRight size={18} style={{ opacity: selectedFloor?.id === f.id ? 1 : 0.3 }} />
                            </div>
                        ))}
                        {floors.length === 0 && !loading && (
                            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                No floors defined
                            </p>
                        )}
                        {loading && (
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Wards/Rooms */}
                <div className="hierarchy-column" style={{ opacity: !selectedFloor ? 0.4 : 1, pointerEvents: !selectedFloor ? 'none' : 'auto' }}>
                    <div className="hierarchy-column-header">
                        <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DoorOpen size={20} className="text-primary" /> 
                            Wards & Rooms
                        </h2>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <Layout size={40} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage Wards and layout in this section</p>
                        <button className="btn-primary" style={{ marginTop: '1.5rem', fontSize: '0.75rem' }} onClick={() => setIsRoomModalOpen(true)}>Configure Ward</button>
                    </div>
                </div>
            </div>
            
            {/* Create Room/Ward Modal */}
            {isRoomModalOpen && selectedFloor && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>Configure New Room / Ward</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>On {selectedBuilding?.name} - {selectedFloor.name}</p>
                            </div>
                            <button type="button" className="icon-btn" onClick={() => setIsRoomModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateRoom}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label>Room / Ward Name or Number *</label>
                                    <input type="text" required className="input-field" placeholder="e.g. Ward A / Room 101" value={newRoomData.roomNumber} onChange={e => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })} />
                                </div>
                                <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Room Type *</label>
                                        <select required className="input-field" value={newRoomData.roomType} onChange={e => setNewRoomData({ ...newRoomData, roomType: e.target.value as any })}>
                                            <option value="GENERAL">General Ward</option>
                                            <option value="SEMI_PRIVATE">Semi-Private</option>
                                            <option value="PRIVATE">Private Room</option>
                                            <option value="ICU">ICU</option>
                                            <option value="EMERGENCY">Emergency</option>
                                            <option value="THEATRE">Operation Theatre</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Bed Capacity *</label>
                                        <input type="number" required min="1" max="100" className="input-field" value={newRoomData.totalBeds} onChange={e => setNewRoomData({ ...newRoomData, totalBeds: parseInt(e.target.value) || 1 })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={() => setIsRoomModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting || !newRoomData.roomNumber}>
                                    {isSubmitting ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--primary-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default InfrastructureManager;
