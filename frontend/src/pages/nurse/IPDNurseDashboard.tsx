import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Thermometer, 
    Activity, 
    Droplet, 
    FileText, 
    LayoutGrid,
    List as ListIcon,
    Pill,
    History
} from 'lucide-react';
import { NurseService } from '../../services/nurse.service';
import type { AdmissionDTO, WardDTO, PrescriptionResponse, MedicationAdministrationDTO } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';

const IPDNurseDashboard: React.FC = () => {
    const [branchInfo, setBranchInfo] = useState<{ id: string, name: string } | null>(null);
    const [admissions, setAdmissions] = useState<AdmissionDTO[]>([]);
    const [wards, setWards] = useState<WardDTO[]>([]);
    const [selectedWard, setSelectedWard] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDTO | null>(null);
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [vitals, setVitals] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        weight: '',
        spo2: '',
        respiratoryRate: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    
    // Medication states
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [activePrescriptions, setActivePrescriptions] = useState<PrescriptionResponse[]>([]);
    const [medicationHistory, setMedicationHistory] = useState<MedicationAdministrationDTO[]>([]);
    const [isMedicationLoading, setIsMedicationLoading] = useState(false);
    const [medicationNotes, setMedicationNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        loadProfileAndData();
    }, []);

    const loadProfileAndData = async () => {
        try {
            const profile = await AdminService.getCurrentProfile();
            const bId = profile.branch?.id;
            if (bId) {
                setBranchInfo({ id: bId, name: profile.branch?.name || 'Main' });
                fetchInitialData(bId);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const fetchInitialData = async (bId?: string) => {
        const fetchId = bId || branchInfo?.id;
        if (!fetchId) return;
        setIsLoading(true);
        try {
            const [wardsData, admissionsData] = await Promise.all([
                NurseService.getWards(fetchId),
                NurseService.getActiveAdmissionsByBranch(fetchId)
            ]);
            setWards(wardsData);
            setAdmissions(admissionsData);
        } catch (error) {
            console.error("Failed to fetch nurse dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWardChange = async (wardId: string) => {
        setSelectedWard(wardId);
        setIsLoading(true);
        try {
            if (wardId === 'all') {
                if (!branchInfo?.id) return;
                const data = await NurseService.getActiveAdmissionsByBranch(branchInfo.id);
                setAdmissions(data);
            } else {
                const data = await NurseService.getActiveAdmissionsByWard(wardId);
                setAdmissions(data);
            }
        } catch (error) {
            console.error("Failed to filter admissions by ward", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenVitals = (admission: AdmissionDTO) => {
        setSelectedAdmission(admission);
        setShowVitalsModal(true);
    };

    const handleSaveVitals = async () => {
        if (!selectedAdmission) return;
        setIsSaving(true);
        try {
            await NurseService.recordVitals(selectedAdmission.id, {
                temperature: vitals.temperature,
                bloodPressure: vitals.bloodPressure,
                heartRate: vitals.heartRate,
                weight: vitals.weight,
                oxygenSaturation: vitals.spo2,
                respiratoryRate: vitals.respiratoryRate,
                height: '0' // Default or add field
            });
            setShowVitalsModal(false);
            setVitals({ temperature: '', bloodPressure: '', heartRate: '', weight: '', spo2: '', respiratoryRate: '' });
            alert("Vitals recorded successfully!");
        } catch (error) {
            console.error("Failed to record vitals", error);
            alert("Failed to record vitals. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenMedication = async (admission: AdmissionDTO) => {
        setSelectedAdmission(admission);
        setShowMedicationModal(true);
        setIsMedicationLoading(true);
        try {
            const [prescriptions, history] = await Promise.all([
                NurseService.getActivePrescriptions(admission.id),
                NurseService.getMedicationHistory(admission.id)
            ]);
            setActivePrescriptions(prescriptions);
            setMedicationHistory(history);
        } catch (error) {
            console.error("Failed to load medication info", error);
        } finally {
            setIsMedicationLoading(false);
        }
    };

    const handleRecordMedication = async (prescription: PrescriptionResponse) => {
        if (!selectedAdmission) return;
        const notes = medicationNotes[prescription.id] || '';
        try {
            await NurseService.recordMedicationAdministration(selectedAdmission.id, {
                medicineName: prescription.medicineName,
                dosage: prescription.dosage,
                route: 'Oral', // Default or make selectable
                notes: notes
            });
            
            // Refresh history
            const history = await NurseService.getMedicationHistory(selectedAdmission.id);
            setMedicationHistory(history);
            
            // Clear notes for this prescription
            setMedicationNotes(prev => ({ ...prev, [prescription.id]: '' }));
            alert(`Medication ${prescription.medicineName} recorded!`);
        } catch (error) {
            console.error("Failed to record medication", error);
            alert("Failed to record medication administration.");
        }
    };

    const filteredAdmissions = admissions.filter(a => 
        a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.bedNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DISCHARGE_REQUESTED':
                return { backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #F59E0B' };
            case 'UNDER_TREATMENT':
                return { backgroundColor: '#DBEAFE', color: '#2563EB', border: '1px solid #3B82F6' };
            default:
                return { backgroundColor: '#D1FAE5', color: '#059669', border: '1px solid #10B981' };
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>IPD Nursing Station</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Branch: {branchInfo?.name || 'Loading...'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search patient or bed..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <button 
                    onClick={() => handleWardChange('all')}
                    className={`ward-chip ${selectedWard === 'all' ? 'active' : ''}`}
                >
                    All Wards
                </button>
                {wards.map(ward => (
                    <button 
                        key={ward.id}
                        onClick={() => handleWardChange(ward.id)}
                        className={`ward-chip ${selectedWard === ward.id ? 'active' : ''}`}
                    >
                        {ward.name}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Users size={16} color="var(--primary)" />
                        <strong>{filteredAdmissions.length}</strong> Patients Admitted
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '4px', background: viewMode === 'grid' ? '#e5e7eb' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <LayoutGrid size={20} color={viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)'} />
                        </button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '4px', background: viewMode === 'list' ? '#e5e7eb' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <ListIcon size={20} color={viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)'} />
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-refresh" onClick={() => fetchInitialData()}>Refresh Data</button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
                    <div className="loader"></div>
                    <p>Updating active patient records...</p>
                </div>
            ) : filteredAdmissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <Users size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: 0 }}>No active patients found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try changing the ward filter or search query.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="patient-grid">
                    {filteredAdmissions.map(admission => (
                        <div key={admission.id} className="patient-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    Bed {admission.bedNumber}
                                </div>
                                <span style={{ ...getStatusStyle(admission.status), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    {admission.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{admission.patientName}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>ID: {admission.id.split('-')[0]}</div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div className="stat-box">
                                    <span className="stat-label">Doc</span>
                                    <span className="stat-value">{admission.admittingDoctorName.split(' ')[0]}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">Ward</span>
                                    <span className="stat-value">{admission.wardName}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <button className="card-action primary" onClick={() => handleOpenVitals(admission)} title="Record Vitals"><Activity size={14} /> Vitals</button>
                                <button className="card-action secondary" style={{ background: '#f0fdf4', color: '#166534' }} onClick={() => handleOpenMedication(admission)} title="Medications"><Pill size={14} /> Meds</button>
                                <button className="card-action secondary"><FileText size={14} /> Hist</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="list-container">
                    <table className="patient-table">
                        <thead>
                            <tr>
                                <th>Bed / Ward</th>
                                <th>Patient Name</th>
                                <th>Status</th>
                                <th>Doctor</th>
                                <th>Adm. Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdmissions.map(admission => (
                                <tr key={admission.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{admission.bedNumber}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{admission.wardName}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{admission.patientName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {admission.id.split('-')[0]}</div>
                                    </td>
                                    <td>
                                        <span style={{ ...getStatusStyle(admission.status), padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {admission.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{admission.admittingDoctorName}</td>
                                    <td>{new Date(admission.admissionDate).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="icon-btn" title="Record Vitals" onClick={() => handleOpenVitals(admission)}><Activity size={18} /></button>
                                            <button className="icon-btn" title="Medications" onClick={() => handleOpenMedication(admission)} style={{ color: '#059669' }}><Pill size={18} /></button>
                                            <button className="icon-btn" title="View History"><FileText size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Vitals Modal */}
            {showVitalsModal && selectedAdmission && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>Record Patient Vitals</h2>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {selectedAdmission.patientName} (Bed {selectedAdmission.bedNumber})
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowVitalsModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="vitals-grid">
                                <div className="form-group">
                                    <label>Temperature (°C)</label>
                                    <div className="input-with-icon">
                                        <Thermometer size={18} />
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={vitals.temperature}
                                            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                            placeholder="36.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Blood Pressure (mmHg)</label>
                                    <div className="input-with-icon">
                                        <Activity size={18} />
                                        <input 
                                            type="text" 
                                            value={vitals.bloodPressure}
                                            onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                                            placeholder="120/80"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Heart Rate (BPM)</label>
                                    <div className="input-with-icon">
                                        <Activity size={18} />
                                        <input 
                                            type="number" 
                                            value={vitals.heartRate}
                                            onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                                            placeholder="72"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>SpO2 (%)</label>
                                    <div className="input-with-icon">
                                        <Droplet size={18} />
                                        <input 
                                            type="number" 
                                            value={vitals.spo2}
                                            onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                            placeholder="98"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <div className="input-with-icon">
                                        <Users size={18} />
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={vitals.weight}
                                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                            placeholder="70.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Resp. Rate (BPM)</label>
                                    <div className="input-with-icon">
                                        <Activity size={18} />
                                        <input 
                                            type="number" 
                                            value={vitals.respiratoryRate}
                                            onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                                            placeholder="16"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowVitalsModal(false)}>Cancel</button>
                            <button 
                                className="btn-save" 
                                onClick={handleSaveVitals}
                                disabled={isSaving || !vitals.temperature || !vitals.bloodPressure || !vitals.heartRate}
                            >
                                {isSaving ? 'Saving...' : 'Save Vitals'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Medication Modal */}
            {showMedicationModal && selectedAdmission && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px', width: '90%' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>Medication Administration</h2>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {selectedAdmission.patientName} (Bed {selectedAdmission.bedNumber} - {selectedAdmission.wardName})
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowMedicationModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', maxHeight: '70vh', overflow: 'hidden' }}>
                            {/* Active Prescriptions */}
                            <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Pill size={20} color="var(--primary)" /> Active Prescriptions
                                </h3>
                                
                                {isMedicationLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}><div className="loader"></div></div>
                                ) : activePrescriptions.length === 0 ? (
                                    <div className="empty-state">No active prescriptions found.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {activePrescriptions.map(p => (
                                            <div key={p.id} className="med-box">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{p.medicineName}</span>
                                                    <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{p.dosage}</span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                                    {p.frequency} • {p.duration}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add note (optional)..."
                                                        style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                        value={medicationNotes[p.id] || ''}
                                                        onChange={(e) => setMedicationNotes({ ...medicationNotes, [p.id]: e.target.value })}
                                                    />
                                                    <button 
                                                        className="btn-save" 
                                                        style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                                        onClick={() => handleRecordMedication(p)}
                                                    >
                                                        Administer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Administration History */}
                            <div style={{ overflowY: 'auto', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <History size={20} color="var(--text-secondary)" /> Recent History
                                </h3>
                                {isMedicationLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}><div className="loader"></div></div>
                                ) : medicationHistory.length === 0 ? (
                                    <div className="empty-state">No medications administered yet.</div>
                                ) : (
                                    <div className="timeline">
                                        {medicationHistory.map(h => (
                                            <div key={h.id} className="timeline-item">
                                                <div className="timeline-dot"></div>
                                                <div className="timeline-content">
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.medicineName} ({h.dosage})</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {new Date(h.administeredAt).toLocaleString()} • {h.administeredByName.split(' ')[0]}
                                                    </div>
                                                    {h.notes && <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '2px' }}>"{h.notes}"</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowMedicationModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    .search-input {
                        padding: 0.6rem 1rem 0.6rem 2.5rem;
                        border: 1.5px solid var(--border);
                        border-radius: var(--radius-md);
                        width: 300px;
                        font-family: inherit;
                        transition: all 0.2s;
                    }
                    .search-input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px var(--primary-light); }
                    
                    .ward-chip {
                        padding: 0.5rem 1.25rem;
                        border: 1.5px solid var(--border);
                        border-radius: 999px;
                        background: white;
                        color: var(--text-secondary);
                        font-weight: 600;
                        white-space: nowrap;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .ward-chip:hover { border-color: var(--primary); color: var(--primary); }
                    .ward-chip.active { background: var(--primary); color: white; border-color: var(--primary); }

                    .btn-refresh {
                        padding: 0.5rem 1rem;
                        background: transparent;
                        border: 1.5px solid var(--border);
                        border-radius: var(--radius-md);
                        font-weight: 600;
                        cursor: pointer;
                        color: var(--text-secondary);
                    }
                    .btn-refresh:hover { background: var(--bg-hover); color: var(--primary); border-color: var(--primary); }

                    .patient-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                        gap: 1.5rem;
                    }

                    .patient-card {
                        background: white;
                        padding: 1.5rem;
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border-light);
                        box-shadow: var(--shadow-sm);
                        transition: all 0.2s ease;
                    }
                    .patient-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--primary-light); }

                    .stat-box {
                        background: #f8fafc;
                        padding: 0.5rem;
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                    }
                    .stat-label { font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; }
                    .stat-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }

                    .card-action {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        padding: 0.6rem;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 0.85rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .card-action.primary { background: var(--primary); color: white; border: none; }
                    .card-action.primary:hover { background: var(--primary-dark); }
                    .card-action.secondary { background: #f1f5f9; color: #475569; border: none; }
                    .card-action.secondary:hover { background: #e2e8f0; }

                    .list-container {
                        background: white;
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border-light);
                        overflow: hidden;
                    }
                    .patient-table { width: 100%; border-collapse: collapse; }
                    .patient-table th { padding: 1rem 1.5rem; text-align: left; background: #f8fafc; border-bottom: 2px solid #f1f5f9; color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
                    .patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
                    .patient-table tr:hover { background: #fafafa; }

                    .icon-btn {
                        padding: 6px;
                        background: transparent;
                        border: none;
                        border-radius: 6px;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .icon-btn:hover { background: var(--primary-light); color: var(--primary); }

                    .loader { border: 3px solid #f3f3f3; border-top: 3px solid var(--primary); border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                    .med-box {
                        padding: 1rem;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                    }
                    .empty-state { text-align: center; color: var(--text-tertiary); padding: 2rem; font-style: italic; }

                    .timeline { border-left: 2px solid #e2e8f0; margin-left: 0.5rem; padding-left: 1rem; }
                    .timeline-item { position: relative; padding-bottom: 1.5rem; }
                    .timeline-dot { position: absolute; left: -1.45rem; top: 0.25rem; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); border: 2px solid white; }
                    .timeline-content { background: white; }
                `}
            </style>
        </div>
    );
};

export default IPDNurseDashboard;
