import { useState, useEffect } from 'react';
import { ReceptionistService } from '../../services/receptionist.service';
import type { WardDTO, BedDTO } from '../../services/api.types';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    hospital_id?: string;
    // Assuming the user token also includes primary_branch_id or we get it from profile
    // For now, we might hardcode or expect a branch selection
}

const WardManagement = () => {
    const [wards, setWards] = useState<WardDTO[]>([]);
    const [selectedWard, setSelectedWard] = useState<WardDTO | null>(null);
    const [beds, setBeds] = useState<BedDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Try to get a branch ID. Since branches are complex, we could fetch all branches 
        // and let the user select, or use a default one for now to test.
        // Wait, the API `getWards` requires a `branchId`. We should probably fetch the branchId from the user's profile.
        // For demonstration, let's assume we have a way or just prompt/fetch for the first branch.
        loadWards();
    }, []);

    const loadWards = async () => {
        setIsLoading(true);
        try {
            // Ideally fetch branchId from profile. For now, we will leave it as an empty string to fetch all if the backend allows it,
            // or we might need to properly integrate this. Let's pass a known branch ID or fetch branches first.
            // Actually, we'll need to fetch the branches the nurse has access to.
            // To simplify, let's fetch branches from AdminService if possible, or just mock it.
            // In a real app, this should come from context. (We'll hardcode or skip branchId if backend allows).
            // Wait, backend requires @RequestParam UUID branchId.
            // Let's just catch the error if we can't fetch it yet.
            const token = TokenService.getToken();
            let tenantId = "";
            if (token) {
                const decoded = jwtDecode<JWTPayload>(token);
                tenantId = decoded.hospital_id || "";
            }
            // Temporarily calling it with a dummy or failing gracefully.
            // We should ideally fetch the current user's primary branch from the Profile endpoint.
            console.log("Need to implement branch selection for Ward Management");
        } catch (error) {
            console.error("Failed to load wards", error);
        } finally {
            setIsLoading(false);
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
        <div className="ward-management-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ward Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Monitor bed occupancy and manage ward capacity.</p>
            </div>

            <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A', color: '#B45309', marginBottom: '2rem' }}>
                Note: In a complete implementation, this view would first fetch the Nurse's primary branch to load the available Wards.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-main)', fontWeight: 600 }}>
                        Hospital Wards
                    </div>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Wards...</div>
                    ) : wards.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No Wards Available</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {wards.map(ward => (
                                <div
                                    key={ward.id}
                                    onClick={() => handleSelectWard(ward)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedWard?.id === ward.id ? 'var(--bg-hover)' : 'white',
                                        borderLeft: selectedWard?.id === ward.id ? '4px solid var(--primary)' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{ward.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Capacity: {ward.occupiedBeds} / {ward.totalCapacity}
                                    </div>
                                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-main)', marginTop: '0.5rem', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(ward.occupiedBeds / ward.totalCapacity) * 100}%`, height: '100%', backgroundColor: ward.occupiedBeds === ward.totalCapacity ? 'var(--danger)' : 'var(--primary)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedWard && (
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{selectedWard.name} - Beds</h2>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#10B981', borderRadius: '50%' }}></div> Available</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#EF4444', borderRadius: '50%' }}></div> Occupied</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#F59E0B', borderRadius: '50%' }}></div> Maintenance</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                            {beds.map(bed => {
                                let bgColor = 'white';
                                let borderColor = 'var(--border-light)';
                                let textColor = 'var(--text-main)';

                                if (bed.status === 'AVAILABLE') {
                                    bgColor = '#ECFDF5';
                                    borderColor = '#10B981';
                                    textColor = '#047857';
                                } else if (bed.status === 'OCCUPIED') {
                                    bgColor = '#FEF2F2';
                                    borderColor = '#EF4444';
                                    textColor = '#B91C1C';
                                } else if (bed.status === 'MAINTENANCE') {
                                    bgColor = '#FFFBEB';
                                    borderColor = '#F59E0B';
                                    textColor = '#B45309';
                                }

                                return (
                                    <div key={bed.id} style={{
                                        border: `2px solid ${borderColor}`,
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{bed.bedNumber}</div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>Room {bed.roomNumber}</div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>{bed.status}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default WardManagement;
