import React, { useState, useEffect } from 'react';
import { 
    User, Search, Activity, FileText, Pill, Beaker, 
    Clipboard, Calendar, Download, Plus, ChevronRight, X,
    ArrowUpRight, Heart, Droplet, Thermometer, Weight
} from 'lucide-react';
import { DoctorService } from '../../services/doctor.service';
import type { 
    PatientSummaryDTO, PatientEMRResponse, 
    ClinicalNoteDTO, PrescriptionResponse, 
    VitalsResponse, LabTestRequestResponse, AdmissionSummaryDTO
} from '../../services/api.types';
import '../../styles/patient-theme.css';

const Patients = () => {
    const [patients, setPatients] = useState<PatientSummaryDTO[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [emrData, setEmrData] = useState<PatientEMRResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'prescriptions' | 'labs' | 'vitals' | 'admissions'>('overview');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isLabModalOpen, setIsLabModalOpen] = useState(false);
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

    // Form states
    const [newNote, setNewNote] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
    const [newPrescription, setNewPrescription] = useState({ medicineName: '', dosage: '', frequency: '', duration: '' });
    const [newLabTest, setNewLabTest] = useState({ testType: '', priority: 'ROUTINE', notes: '' });
    const [newVitals, setNewVitals] = useState({ bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', height: '', weight: '' });
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingEMR, setIsLoadingEMR] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatientId) {
            fetchEMR(selectedPatientId);
        }
    }, [selectedPatientId]);

    const fetchPatients = async () => {
        setIsLoadingList(true);
        try {
            const data = await DoctorService.getPatientsForDoctor();
            setPatients(data);
            if (data.length > 0 && !selectedPatientId) {
                setSelectedPatientId(data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setIsLoadingList(false);
        }
    };

    const fetchEMR = async (id: string) => {
        setIsLoadingEMR(true);
        try {
            const data = await DoctorService.getPatientFullEMR(id);
            setEmrData(data);
        } catch (error) {
            console.error("Failed to fetch EMR data", error);
        } finally {
            setIsLoadingEMR(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedPatientId) return;
        try {
            await DoctorService.createPatientNote(selectedPatientId, {
                ...newNote,
                patientId: selectedPatientId,
                appointmentId: '' // Direct note, not linked to specific appointment
            });
            setIsNoteModalOpen(false);
            setNewNote({ subjective: '', objective: '', assessment: '', plan: '' });
            fetchEMR(selectedPatientId);
        } catch (error) {
            console.error("Failed to save note", error);
        }
    };

    const handleSavePrescription = async () => {
        if (!selectedPatientId) return;
        try {
            await DoctorService.createClinicalPrescription(selectedPatientId, newPrescription);
            setIsPrescriptionModalOpen(false);
            setNewPrescription({ medicineName: '', dosage: '', frequency: '', duration: '' });
            fetchEMR(selectedPatientId);
        } catch (error) {
            console.error("Failed to save prescription", error);
        }
    };

    const handleSaveLabTest = async () => {
        if (!selectedPatientId) return;
        try {
            await DoctorService.requestLabTest(selectedPatientId, newLabTest);
            setIsLabModalOpen(false);
            setNewLabTest({ testType: '', priority: 'ROUTINE', notes: '' });
            fetchEMR(selectedPatientId);
        } catch (error) {
            console.error("Failed to save lab test", error);
        }
    };

    const handleSaveVitals = async () => {
        if (!selectedPatientId) return;
        try {
            await DoctorService.recordVitals(selectedPatientId, newVitals);
            setIsVitalsModalOpen(false);
            setNewVitals({ bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', height: '', weight: '' });
            fetchEMR(selectedPatientId);
        } catch (error) {
            console.error("Failed to save vitals", error);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const Modal = ({ title, isOpen, onClose, onSave, children }: { title: string, isOpen: boolean, onClose: () => void, onSave: () => void, children: React.ReactNode }) => {
        if (!isOpen) return null;
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="card" style={{ width: '500px', maxWidth: '90%', padding: '0' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>{title}</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ padding: '1.5rem' }}>{children}</div>
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" onClick={onSave} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Save Changes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="patient-theme" style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
            {/* Modals */}
            <Modal title="New Clinical Note" isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveNote}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea placeholder="Subjective..." value={newNote.subjective} onChange={e => setNewNote({...newNote, subjective: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} rows={2} />
                    <textarea placeholder="Objective..." value={newNote.objective} onChange={e => setNewNote({...newNote, objective: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} rows={2} />
                    <textarea placeholder="Assessment..." value={newNote.assessment} onChange={e => setNewNote({...newNote, assessment: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} rows={2} />
                    <textarea placeholder="Plan..." value={newNote.plan} onChange={e => setNewNote({...newNote, plan: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} rows={2} />
                </div>
            </Modal>

            <Modal title="Record Prescription" isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} onSave={handleSavePrescription}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input placeholder="Medicine Name" value={newPrescription.medicineName} onChange={e => setNewPrescription({...newPrescription, medicineName: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Dosage (e.g. 500mg)" value={newPrescription.dosage} onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Frequency (e.g. 1-0-1)" value={newPrescription.frequency} onChange={e => setNewPrescription({...newPrescription, frequency: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Duration (e.g. 5 days)" value={newPrescription.duration} onChange={e => setNewPrescription({...newPrescription, duration: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                </div>
            </Modal>

            <Modal title="Request Lab Test" isOpen={isLabModalOpen} onClose={() => setIsLabModalOpen(false)} onSave={handleSaveLabTest}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input placeholder="Test Type (e.g. CBC)" value={newLabTest.testType} onChange={e => setNewLabTest({...newLabTest, testType: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <select value={newLabTest.priority} onChange={e => setNewLabTest({...newLabTest, priority: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }}>
                        <option value="ROUTINE">Routine</option>
                        <option value="URGENT">Urgent</option>
                        <option value="EMERGENCY">Emergency</option>
                    </select>
                    <textarea placeholder="Notes..." value={newLabTest.notes} onChange={e => setNewLabTest({...newLabTest, notes: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} rows={3} />
                </div>
            </Modal>

            <Modal title="Record Vitals" isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} onSave={handleSaveVitals}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input placeholder="BP (e.g. 120/80)" value={newVitals.bloodPressure} onChange={e => setNewVitals({...newVitals, bloodPressure: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="HR (bpm)" value={newVitals.heartRate} onChange={e => setNewVitals({...newVitals, heartRate: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Temp (°F)" value={newVitals.temperature} onChange={e => setNewVitals({...newVitals, temperature: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="SpO2 (%)" value={newVitals.oxygenSaturation} onChange={e => setNewVitals({...newVitals, oxygenSaturation: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Height (cm)" value={newVitals.height} onChange={e => setNewVitals({...newVitals, height: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                    <input placeholder="Weight (kg)" value={newVitals.weight} onChange={e => setNewVitals({...newVitals, weight: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                </div>
            </Modal>

            {/* Left Pane: Patient List */}
            <div style={{ 
                width: '350px', 
                borderRight: '1px solid var(--border-light)', 
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>My Patients</h2>
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {isLoadingList ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No patients found</div>
                    ) : (
                        filteredPatients.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => setSelectedPatientId(p.id)}
                                style={{ 
                                    padding: '1.25rem', 
                                    borderBottom: '1px solid var(--border-light)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: selectedPatientId === p.id ? 'var(--primary-light)' : 'transparent',
                                    borderLeft: selectedPatientId === p.id ? '4px solid var(--primary)' : '4px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                    <span className="status-badge-sm" style={{ 
                                        backgroundColor: p.patientType === 'IPD' ? '#FEF3C7' : '#DBEAFE',
                                        color: p.patientType === 'IPD' ? '#B45309' : '#1E40AF'
                                    }}>
                                        {p.patientType}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                                    <span>{p.age} Yrs</span>
                                    <span>{p.gender}</span>
                                    <span>{p.bloodGroup || 'N/A'}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    Last Visit: {formatDate(p.lastVisitDate)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane: EMR Detail */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', overflowY: 'auto' }}>
                {!selectedPatientId ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
                        <User size={64} opacity={0.2} style={{ marginBottom: '1rem' }} />
                        <p>Select a patient to view EMR</p>
                    </div>
                ) : isLoadingEMR ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner"></div>
                        <p style={{ marginLeft: '1rem' }}>Loading Medical Records...</p>
                    </div>
                ) : emrData ? (
                    <>
                        {/* Patient Detail Header */}
                        <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{emrData.patientDetails.firstName} {emrData.patientDetails.lastName}</h1>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <span><strong>Patient ID:</strong> {emrData.patientDetails.id.substring(0, 8)}</span>
                                    <span><strong>Age/Gender:</strong> {emrData.patientDetails.gender}</span>
                                    <span><strong>Blood Group:</strong> {emrData.patientDetails.bloodGroup || 'N/A'}</span>
                                    <span><strong>Contact:</strong> {emrData.patientDetails.phone}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    className="btn-primary" 
                                    onClick={() => setIsNoteModalOpen(true)}
                                    style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={18} /> New Note
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => setIsPrescriptionModalOpen(true)}
                                        style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Clipboard size={18} /> Prescribe
                                    </button>
                                </div>
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => setIsLabModalOpen(true)}
                                    style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Beaker size={18} /> Lab Test
                                </button>
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => setIsVitalsModalOpen(true)}
                                    style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Activity size={18} /> Vitals
                                </button>
                            </div>
                        </div>

                        {/* EMR Tabs */}
                        <div className="patient-content" style={{ padding: '1.5rem 2rem' }}>
                            <div className="patient-nav" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
                                <a className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</a>
                                <a className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Clinical Notes</a>
                                <a className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => setActiveTab('prescriptions')}>Prescriptions</a>
                                <a className={activeTab === 'labs' ? 'active' : ''} onClick={() => setActiveTab('labs')}>Lab Reports</a>
                                <a className={activeTab === 'vitals' ? 'active' : ''} onClick={() => setActiveTab('vitals')}>Vitals</a>
                                <a className={activeTab === 'admissions' ? 'active' : ''} onClick={() => setActiveTab('admissions')}>Admission History</a>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {activeTab === 'overview' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Heart size={20} color="var(--danger)" /> Recent Vitals
                                            </h3>
                                            {emrData.vitalsHistory.length > 0 ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Blood Pressure</span>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{emrData.vitalsHistory[0].bloodPressure}</div>
                                                    </div>
                                                    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Heart Rate</span>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{emrData.vitalsHistory[0].heartRate} bpm</div>
                                                    </div>
                                                    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Temperature</span>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{emrData.vitalsHistory[0].temperature}°F</div>
                                                    </div>
                                                    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>SpO2</span>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{emrData.vitalsHistory[0].oxygenSaturation}%</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ color: 'var(--text-tertiary)' }}>No vitals recorded recently</p>
                                            )}
                                        </div>

                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clipboard size={20} color="var(--primary)" /> Medical History
                                            </h3>
                                            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', minHeight: '120px' }}>
                                                {emrData.patientDetails.medicalHistory || 'No prior medical history available.'}
                                            </div>
                                        </div>

                                        <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Active Prescriptions</h3>
                                            <div className="table-container">
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Medicine</th>
                                                            <th>Dosage</th>
                                                            <th>Frequency</th>
                                                            <th>Duration</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {emrData.prescriptions.slice(0, 3).map(p => (
                                                            <tr key={p.id}>
                                                                <td style={{ fontWeight: 600 }}>{p.medicineName}</td>
                                                                <td>{p.dosage}</td>
                                                                <td>{p.frequency}</td>
                                                                <td>{p.duration}</td>
                                                                <td>{formatDate(p.createdAt)}</td>
                                                            </tr>
                                                        ))}
                                                        {emrData.prescriptions.length === 0 && (
                                                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No active prescriptions</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {emrData.clinicalNotes.map(note => (
                                            <div key={note.id} className="card" style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <Calendar size={18} color="var(--primary)" />
                                                        <span style={{ fontWeight: 600 }}>Visit Note • {formatDate(note.createdAt)}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>By Dr. {note.doctorName}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Subjective</span>
                                                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{note.subjective}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Objective</span>
                                                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{note.objective}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Assessment</span>
                                                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{note.assessment}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>Plan</span>
                                                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{note.plan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <div className="card">
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Medicine</th>
                                                        <th>Dosage</th>
                                                        <th>Frequency</th>
                                                        <th>Duration</th>
                                                        <th>Prescribed On</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emrData.prescriptions.map(p => (
                                                        <tr key={p.id}>
                                                            <td style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{p.medicineName}</td>
                                                            <td>{p.dosage}</td>
                                                            <td>{p.frequency}</td>
                                                            <td>{p.duration}</td>
                                                            <td>{formatDate(p.createdAt)}</td>
                                                            <td><button className="btn-icon"><Download size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'labs' && (
                                    <div className="card">
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Test Name</th>
                                                        <th>Priority</th>
                                                        <th>Status</th>
                                                        <th>Date Requested</th>
                                                        <th>Report</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emrData.labReports.map(lab => (
                                                        <tr key={lab.id}>
                                                            <td style={{ fontWeight: 600 }}>{lab.testType}</td>
                                                            <td>
                                                                <span className="status-badge-sm" style={{ 
                                                                    backgroundColor: lab.priority === 'URGENT' ? '#FEE2E2' : '#F3F4F6',
                                                                    color: lab.priority === 'URGENT' ? '#B91C1C' : '#374151'
                                                                }}>
                                                                    {lab.priority}
                                                                </span>
                                                            </td>
                                                            <td>{lab.status}</td>
                                                            <td>{formatDate(lab.requestedAt)}</td>
                                                            <td><button className="btn-icon" disabled={lab.status !== 'COMPLETED'}><FileText size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'vitals' && (
                                    <div className="card">
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>BP</th>
                                                        <th>HR</th>
                                                        <th>Temp</th>
                                                        <th>SpO2</th>
                                                        <th>Height</th>
                                                        <th>Weight</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emrData.vitalsHistory.map(v => (
                                                        <tr key={v.id}>
                                                            <td>{formatDate(v.recordedAt)}</td>
                                                            <td style={{ fontWeight: 600 }}>{v.bloodPressure}</td>
                                                            <td>{v.heartRate} bpm</td>
                                                            <td>{v.temperature}°F</td>
                                                            <td>{v.oxygenSaturation}%</td>
                                                            <td>{v.height}</td>
                                                            <td>{v.weight}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'admissions' && (
                                    <div className="card">
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Admission Date</th>
                                                        <th>Discharge Date</th>
                                                        <th>Ward</th>
                                                        <th>Bed</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emrData.admissionHistory.map(adm => (
                                                        <tr key={adm.id}>
                                                            <td>{formatDate(adm.admissionDate)}</td>
                                                            <td>{formatDate(adm.dischargeDate)}</td>
                                                            <td>{adm.wardName}</td>
                                                            <td>{adm.bedNumber}</td>
                                                            <td>
                                                                <span className="status-badge-sm" style={{ 
                                                                    backgroundColor: adm.status === 'ADMITTED' ? '#DEFBE6' : '#F3F4F6',
                                                                    color: adm.status === 'ADMITTED' ? '#198038' : '#374151'
                                                                }}>
                                                                    {adm.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            <style>{`
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid var(--primary-light);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .search-bar {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    color: var(--text-tertiary);
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th {
                    text-align: left;
                    padding: 1rem;
                    background: var(--bg-main);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .data-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-light);
                    font-size: 0.875rem;
                }
                .status-badge-sm {
                    padding: 0.25rem 0.625rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default Patients;
