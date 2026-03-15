import React, { useState, useEffect } from 'react';
import { Bed, Home, AlertCircle, Search, Filter, RefreshCw, ChevronRight, UserPlus, Clock } from 'lucide-react';
import { ReceptionistService } from '../../services/receptionist.service';
import { AdminService } from '../../services/admin.service';
import type { WardDTO, BedDTO, AdmissionDTO } from '../../services/api.types';

const WardManagement: React.FC = () => {
    const [wards, setWards] = useState<WardDTO[]>([]);
    const [selectedWard, setSelectedWard] = useState<WardDTO | null>(null);
    const [beds, setBeds] = useState<BedDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [branchName, setBranchName] = useState('Loading...');
    
    // IPD Specific
    const [pendingAdmissions, setPendingAdmissions] = useState<AdmissionDTO[]>([]);
    const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDTO | null>(null);
    const [isAssigningBed, setIsAssigningBed] = useState(false);

    useEffect(() => {
        loadBranchAndWards();
        loadPendingAdmissions();
    }, []);

    const loadBranchAndWards = async () => {
        setIsLoading(true);
        try {
            const profile = await AdminService.getCurrentProfile();
            const branchId = profile.branch?.id;
            const bName = profile.branch?.name || "Main Branch";
            setBranchName(bName);

            if (branchId) {
                const data = await ReceptionistService.getWardsByBranch(branchId);
                setWards(data);
                if (data.length > 0 && !selectedWard) {
                    handleSelectWard(data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to load wards", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadPendingAdmissions = async () => {
        try {
            const data = await ReceptionistService.getPendingAdmissions();
            setPendingAdmissions(data);
        } catch (error) {
            console.error("Failed to load pending admissions", error);
        }
    };

    const handleAssignBed = async (admissionId: string, bedId: string) => {
        setIsAssigningBed(true);
        try {
            await ReceptionistService.assignBed(admissionId, { bedId });
            alert("Bed assigned successfully.");
            setSelectedAdmission(null);
            loadBranchAndWards();
            loadPendingAdmissions();
        } catch (error) {
            console.error("Failed to assign bed", error);
            alert("Failed to assign bed.");
        } finally {
            setIsAssigningBed(false);
        }
    };

    const handleSelectWard = async (ward: WardDTO) => {
        setSelectedWard(ward);
        try {
            const data = await ReceptionistService.getBedsByWard(ward.id);
            setBeds(data);
        } catch (error) {
            console.error("Failed to load beds for ward", error);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Ward Management</h1>
                    <p className="page-description">Managing occupancy for <strong>{branchName}</strong>.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="status-badge" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)', cursor: 'pointer' }} onClick={loadPendingAdmissions}>
                        <UserPlus size={16} style={{ marginRight: '0.4rem' }} />
                        {pendingAdmissions.length} Pending Admissions
                    </div>
                    <button className="btn-secondary" onClick={loadBranchAndWards}>
                        <RefreshCw size={18} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Ward List Sidebar */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ gap: '0.5rem' }}><Home size={20} className="text-primary" /> All Wards</h3>
                        <span className="status-badge-sm" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {wards.length}
                        </span>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {isLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                        ) : wards.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No Wards Found</div>
                        ) : (
                            wards.map(ward => (
                                <div
                                    key={ward.id}
                                    onClick={() => handleSelectWard(ward)}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedWard?.id === ward.id ? 'var(--primary-light)' : 'transparent',
                                        border: selectedWard?.id === ward.id ? '1px solid var(--primary)' : '1px solid transparent',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: selectedWard?.id === ward.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                                            {ward.name}
                                        </span>
                                        <ChevronRight size={16} style={{ opacity: selectedWard?.id === ward.id ? 1 : 0.3 }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {ward.occupiedBeds} / {ward.totalCapacity} Beds
                                        </div>
                                        <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${(ward.occupiedBeds / ward.totalCapacity) * 100}%`, 
                                                height: '100%', 
                                                backgroundColor: (ward.occupiedBeds / ward.totalCapacity) > 0.9 ? 'var(--danger)' : 'var(--primary)' 
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pending Admissions Queue */}
                    <div className="card" style={{ marginTop: '1.5rem', flex: 'none' }}>
                        <div className="panel-header">
                            <h3 style={{ gap: '0.5rem' }}><Clock size={18} className="text-warning" /> Pending Requests</h3>
                        </div>
                        <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {pendingAdmissions.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                    No pending requests
                                </div>
                            ) : (
                                pendingAdmissions.map(adm => (
                                    <div 
                                        key={adm.id} 
                                        onClick={() => setSelectedAdmission(adm)}
                                        style={{ 
                                            padding: '1rem', 
                                            borderRadius: 'var(--radius-md)', 
                                            border: selectedAdmission?.id === adm.id ? '1px solid var(--warning)' : '1px solid var(--border-light)',
                                            backgroundColor: selectedAdmission?.id === adm.id ? 'var(--warning-light)' : 'white',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{adm.patientId.substring(0,8)}</span>
                                            <span className="status-badge-sm" style={{ backgroundColor: 'white', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                                                {adm.urgencyLevel}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {adm.reasonForAdmission}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    </div>
                </div>

                {/* Bed Grid Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedWard ? (
                        <>
                            <div className="card">
                                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ gap: '0.5rem' }}>
                                        <Bed size={20} className="text-primary" />
                                        {selectedWard.name} Unit Visualization
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                                            Available
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                                            Occupied
                                        </div>
                                    </div>
                                </div>
                                <div className="panel-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                                        {beds.map(bed => {
                                            const statusColor = bed.status === 'AVAILABLE' ? 'var(--success)' : (bed.status === 'OCCUPIED' ? 'var(--danger)' : 'var(--warning)');
                                            const statusBg = bed.status === 'AVAILABLE' ? 'var(--success-bg)' : (bed.status === 'OCCUPIED' ? 'var(--danger-bg)' : 'var(--warning-bg)');
                                            
                                            return (
                                                <div key={bed.id} style={{
                                                    padding: '1.5rem 1rem',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: `1.5px solid ${statusColor}`,
                                                    backgroundColor: statusBg,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                                    transition: 'transform 0.2s',
                                                    cursor: 'default'
                                                }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor }}>{bed.bedNumber}</div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ROOM {bed.roomNumber}</div>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 800, 
                                                        padding: '0.2rem 0.5rem', 
                                                        borderRadius: '4px', 
                                                        background: 'white',
                                                        color: statusColor,
                                                        border: `1px solid ${statusColor}`
                                                    }}>
                                                        {bed.status}
                                                    </span>
                                                    {selectedAdmission && bed.status === 'AVAILABLE' && (
                                                        <button 
                                                            className="btn-primary" 
                                                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', marginTop: '0.5rem', width: '100%' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssignBed(selectedAdmission.id, bed.id);
                                                            }}
                                                            disabled={isAssigningBed}
                                                        >
                                                            {isAssigningBed ? 'Assigning...' : 'Assign here'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card" style={{ backgroundColor: 'var(--bg-main)', border: '1.5px dashed var(--border)' }}>
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <AlertCircle size={32} style={{ marginBottom: '1rem', opacity: 0.5, margin: '0 auto' }} />
                                    <h4>Admission Control</h4>
                                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Select a bed to process a direct IPD admission or transfer from ER.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ opacity: 0.3, marginBottom: '1.5rem' }}>
                                <Bed size={64} style={{ margin: '0 auto' }} />
                            </div>
                            <h3>Select a ward to view real-time occupancy</h3>
                            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Unit telemetry and patient assignment will be displayed here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardManagement;

