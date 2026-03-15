import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { DoctorService } from '../../services/doctor.service';
import { DiagnosticService } from '../../services/diagnostics.service';
import type { 
    PatientResponse, 
    ClinicalNoteDTO, 
    AppointmentResponse, 
    MedicineDTO, 
    AdmissionDTO, 
    DiagnosticTestCatalogDTO, 
    AdmissionStatus,
    PatientEMRResponse,
    PrescriptionResponse,
    LabTestRequestResponse,
    VitalsResponse
} from '../../services/api.types';
import { User, Calendar, Activity, FileText, ChevronLeft, Save, Search, X, Plus, Beaker, Bed, Ban, Share2, ClipboardList, Thermometer } from 'lucide-react';

const PatientEMR = () => {
    const { id: patientId } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const appointmentId = queryParams.get('appointmentId');

    const [patient, setPatient] = useState<PatientResponse | null>(null);
    const [notes, setNotes] = useState<ClinicalNoteDTO[]>([]);
    const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
    const [labReports, setLabReports] = useState<LabTestRequestResponse[]>([]);
    const [vitalsHistory, setVitalsHistory] = useState<VitalsResponse[]>([]);
    const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
    const [admissions, setAdmissions] = useState<AdmissionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Deny/Transfer Modal States
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [denyReason, setDenyReason] = useState('');
    const [transferDept, setTransferDept] = useState('');
    const [transferDoctorId, setTransferDoctorId] = useState('');
    const [transferReason, setTransferReason] = useState('');
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    // SOAP Note Form State
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Prescription State
    const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [prescriptionItems, setPrescriptionItems] = useState<{ medicineId: string, name: string, qty: number, instructions: string }[]>([]);
    const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);

    // Diagnostics State
    const [diagnosticCatalog, setDiagnosticCatalog] = useState<DiagnosticTestCatalogDTO[]>([]);
    const [searchTest, setSearchTest] = useState('');
    const [selectedTests, setSelectedTests] = useState<DiagnosticTestCatalogDTO[]>([]);
    
    // Admission Request State
    const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
    const [admissionReason, setAdmissionReason] = useState('');
    const [admissionUrgency, setAdmissionUrgency] = useState('ROUTINE');
    const [admissionDepartment, setAdmissionDepartment] = useState('');
    const [admissionCareLevel, setAdmissionCareLevel] = useState('GENERAL'); // NEW: Care Level
    const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);

    const formatDoctorName = (name?: string) => {
        if (!name) return 'N/A';
        const trimmed = name.trim();
        if (trimmed.toLowerCase().startsWith('dr.')) return trimmed;
        return `Dr. ${trimmed}`;
    };

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        }
        if (appointmentId) {
            fetchAppointmentData();
            fetchMedicines();
            fetchCatalog();
        }
    }, [patientId, appointmentId]);

    const fetchMedicines = async () => {
        try {
            const data = await DoctorService.getMedicines();
            setMedicines(data);
        } catch (error) {
            console.error("Failed to load medicines catalog", error);
        }
    };

    const fetchCatalog = async () => {
        try {
            const data = await DiagnosticService.getCatalog();
            setDiagnosticCatalog(data);
        } catch (error) {
            console.error("Failed to load diagnostic catalog", error);
        }
    };

    const fetchPatientData = async () => {
        setIsLoading(true);
        try {
            const emrData = await DoctorService.getPatientFullEMR(patientId!);
            setPatient(emrData.patientDetails);
            setNotes(emrData.clinicalNotes || []);
            setPrescriptions(emrData.prescriptions || []);
            setLabReports(emrData.labReports || []);
            setVitalsHistory(emrData.vitalsHistory || []);
            
            // Admissions are still fetched separately as they might not be in EMR response directly or mapped differently
            const admissionsData = await DoctorService.getAdmissionsByPatient(patientId!);
            setAdmissions(admissionsData);
        } catch (error) {
            console.error("Failed to load patient EMR", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDischarge = async (admissionId: string) => {
        if (!confirm("Are you sure you want to discharge this patient?")) return;
        try {
            await DoctorService.dischargePatient(admissionId);
            alert("Patient discharged successfully.");
            fetchPatientData(); // Refresh to update status
        } catch (error) {
            console.error("Failed to discharge patient", error);
            alert("Failed to discharge patient.");
        }
    };

    const fetchAppointmentData = async () => {
        try {
            const aptData = await DoctorService.getAppointmentDetails(appointmentId!);
            setAppointment(aptData);
            if (aptData.status === 'SCHEDULED' || aptData.status === 'CHECKED_IN') {
                // Auto transition to IN_PROGRESS when doctor opens the visit
                await DoctorService.updateAppointment(aptData.id, { status: 'IN_PROGRESS' });
                setAppointment({ ...aptData, status: 'IN_PROGRESS' });
            }
        } catch (error) {
            console.error("Failed to load appointment", error);
        }
    };

    const handleDenyAppointment = async () => {
        if (!appointmentId || !denyReason) return;
        setIsSubmittingAction(true);
        try {
            await DoctorService.denyAppointment(appointmentId, denyReason);
            alert("Appointment denied and returned to receptionist.");
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error("Failed to deny appointment", error);
            alert("Failed to deny appointment.");
        } finally {
            setIsSubmittingAction(false);
            setIsDenyModalOpen(false);
        }
    };

    const handleTransferAppointment = async () => {
        if (!appointmentId || !transferDept) return;
        setIsSubmittingAction(true);
        try {
            await DoctorService.transferAppointment(appointmentId, transferDept, transferDoctorId || undefined, transferReason || undefined);
            alert(`Appointment transferred to ${transferDept} department.`);
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error("Failed to transfer appointment", error);
            alert("Failed to transfer appointment.");
        } finally {
            setIsSubmittingAction(false);
            setIsTransferModalOpen(false);
        }
    };

    const handleSaveNote = async () => {
        if (!appointmentId || !patientId) return;
        setIsSavingNote(true);
        try {
            const newNote = await DoctorService.createClinicalNote(appointmentId, {
                patientId,
                appointmentId,
                subjective,
                objective,
                assessment,
                plan,
                followUpDate: followUpDate || undefined
            });
            // Add new note to the top of the timeline
            setNotes([newNote, ...notes]);
            // Clear form
            setSubjective('');
            setObjective('');
            setAssessment('');
            setPlan('');
            setFollowUpDate('');
            alert('Clinical note saved successfully!');
        } catch (error) {
            console.error("Failed to save note", error);
            alert("Failed to save clinical note.");
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleAddMedicine = (med: MedicineDTO) => {
        if (!prescriptionItems.find(item => item.medicineId === med.id)) {
            setPrescriptionItems([...prescriptionItems, { medicineId: med.id, name: med.name, qty: 1, instructions: '1x a day' }]);
        }
        setSearchTerm('');
    };

    const handleRemoveMedicine = (id: string) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.medicineId !== id));
    };

    const handleSubmitPrescriptionAndComplete = async () => {
        if (!appointmentId || !patientId) return;
        setIsSubmittingPrescription(true);
        try {
            if (prescriptionItems.length > 0) {
                await DoctorService.createPrescription({
                    patientId,
                    appointmentId,
                    items: prescriptionItems.map(item => ({
                        medicineId: item.medicineId,
                        prescribedQuantity: item.qty,
                        dosageInstructions: item.instructions
                    }))
                });
            }

            if (selectedTests.length > 0) {
                await DiagnosticService.createOrder({
                    patientId,
                    appointmentId,
                    testCatalogIds: selectedTests.map(t => t.id),
                    clinicalNotes: "Ordered during consultation."
                });
            }
            // Update appointment status to COMPLETED
            await DoctorService.updateAppointment(appointmentId, { status: 'COMPLETED' });
            setAppointment(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
            alert(prescriptionItems.length > 0 ? "Prescription sent and visit completed!" : "Visit completed!");
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error("Failed to complete visit", error);
            alert("Failed to complete visit.");
        } finally {
            setIsSubmittingPrescription(false);
        }
    };

    const handleRequestAdmission = async () => {
        if (!patientId) return;
        setIsSubmittingAdmission(true);
        try {
            await DoctorService.requestAdmission({
                patientId,
                reasonForAdmission: `${admissionReason} (${admissionCareLevel})`,
                urgencyLevel: admissionUrgency,
                department: admissionDepartment
            });
            alert("Admission requested successfully. Receptionist notified.");
            setIsAdmissionModalOpen(false);
            fetchPatientData(); // Refresh history
        } catch (error) {
            console.error("Failed to request admission", error);
            alert("Failed to request admission.");
        } finally {
            setIsSubmittingAdmission(false);
        }
    };

    const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString();
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return <div className="loading-state"><div className="spinner"></div><p>Loading Patient EMR...</p></div>;
    }

    if (!patient) {
        return <div className="empty-state"><h2>Patient Not Found</h2><button className="btn-secondary" onClick={() => navigate('/doctor/dashboard')}>Back to Dashboard</button></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => navigate('/doctor/dashboard')} style={{ background: 'white' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="page-title">{patient.firstName} {patient.lastName}</h2>
                        <p className="page-description">
                            Patient ID: {patient.id.substring(0, 8)} • {patient.gender} • {patient.bloodGroup || 'Blood Group N/A'}
                        </p>
                    </div>
                </div>
                {appointment && (
                    <div className="status-badge-sm status-active" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                        Active Visit • {formatTime(appointment.appointmentTime)}
                    </div>
                )}
                {!appointment && (
                     <button className="btn-primary" onClick={() => setIsAdmissionModalOpen(true)} style={{ backgroundColor: 'var(--warning)', color: 'white' }}>
                        <Bed size={18} style={{ marginRight: '0.5rem' }} />
                        Request Admission
                    </button>
                )}
            </div>

            <div className="emr-layout">
                {/* Left Column: EMR Timeline */}
                <div className="timeline-col">
                    <div className="card patient-info-card">
                        <h3>Patient Vitals & History</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">DOB</span>
                                <span className="info-value">{formatDate(patient.dateOfBirth)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Contact</span>
                                <span className="info-value">{patient.phone}</span>
                            </div>
                        </div>
                        <div className="info-item" style={{ marginTop: '1rem' }}>
                            <span className="info-label">Medical History</span>
                            <p className="info-value history-text">{patient.medicalHistory || 'No prior medical history recorded.'}</p>
                        </div>
                    </div>

                    <div className="card timeline-card">
                        <div className="panel-header">
                            <h3><Activity size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> EMR Timeline</h3>
                        </div>
                        <div className="timeline-list">
                            {notes.length === 0 && admissions.length === 0 ? (
                                <div className="empty-state" style={{ padding: '2rem' }}>
                                    <FileText size={32} color="var(--border)" />
                                    <p>No previous visits or admissions recorded.</p>
                                </div>
                            ) : (
                                <>
                                    {admissions.map(adm => (
                                        <div key={adm.id} className="timeline-entry" style={{ borderLeft: '3px solid #F59E0B', paddingLeft: '1rem', marginLeft: '20px' }}>
                                            <div className="timeline-date" style={{ background: '#FEF3C7', color: '#B45309' }}>
                                                <div className="month">{new Date(adm.admissionDate).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="day">{new Date(adm.admissionDate).getDate()}</div>
                                                <div className="year">{new Date(adm.admissionDate).getFullYear()}</div>
                                            </div>
                                            <div className="timeline-content" style={{ borderColor: '#FDE68A' }}>
                                                <div className="timeline-header">
                                                    <h4>Hospital Admission</h4>
                                                    <span className="doctor-tag" style={{ background: '#FEF3C7', borderColor: '#FDE68A', color: '#B45309' }}>{formatDoctorName(adm.admittingDoctorName)}</span>
                                                </div>
                                                <div className="soap-block">
                                                    <div className="soap-item"><strong>Reason:</strong> {adm.reasonForAdmission}</div>
                                                    <div className="soap-item"><strong>Status:</strong> <span style={{ fontWeight: 600, color: adm.status === 'ADMITTED' ? '#10B981' : '#6B7280' }}>{adm.status}</span></div>
                                                    {adm.status === 'DISCHARGED' && adm.dischargeDate && (
                                                        <div className="soap-item"><strong>Discharged:</strong> {formatDate(adm.dischargeDate)}</div>
                                                    )}
                                                    {adm.status === 'ADMITTED' && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <button
                                                                className="btn-primary"
                                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                                onClick={() => handleDischarge(adm.id)}
                                                            >
                                                                Discharge Patient
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {notes.map((note) => (
                                        <div key={note.id} className="timeline-entry">
                                            <div className="timeline-date">
                                                <div className="month">{new Date(note.createdAt).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="day">{new Date(note.createdAt).getDate()}</div>
                                                <div className="year">{new Date(note.createdAt).getFullYear()}</div>
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <h4>Visit Notes</h4>
                                                    <span className="doctor-tag">{formatDoctorName(note.doctorName)}</span>
                                                </div>
                                                <div className="soap-block">
                                                    <div className="soap-item"><strong>S:</strong> {note.subjective}</div>
                                                    <div className="soap-item"><strong>O:</strong> {note.objective}</div>
                                                    <div className="soap-item"><strong>A:</strong> {note.assessment}</div>
                                                    <div className="soap-item"><strong>P:</strong> {note.plan}</div>
                                                </div>
                                                {note.followUpDate && (
                                                    <div className="timeline-footer">
                                                        <Calendar size={14} /> Follow up: {formatDate(note.followUpDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {prescriptions.map(presc => (
                                        <div key={presc.id} className="timeline-entry" style={{ borderLeft: '3px solid #10B981', paddingLeft: '1rem', marginLeft: '20px' }}>
                                            <div className="timeline-date" style={{ background: '#D1FAE5', color: '#047857' }}>
                                                <div className="month">{new Date(presc.createdAt).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="day">{new Date(presc.createdAt).getDate()}</div>
                                                <div className="year">{new Date(presc.createdAt).getFullYear()}</div>
                                            </div>
                                            <div className="timeline-content" style={{ borderColor: '#A7F3D0' }}>
                                                <div className="timeline-header">
                                                    <h4>Prescription</h4>
                                                    <span className="doctor-tag" style={{ background: '#D1FAE5', color: '#047857' }}>{formatDoctorName(presc.doctorName)}</span>
                                                </div>
                                                <div className="soap-block">
                                                    <div className="soap-item"><strong>Medicine:</strong> {presc.medicineName}</div>
                                                    <div className="soap-item"><strong>Dosage:</strong> {presc.dosage} • {presc.frequency} for {presc.duration}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {labReports.map(lab => (
                                        <div key={lab.id} className="timeline-entry" style={{ borderLeft: '3px solid #3B82F6', paddingLeft: '1rem', marginLeft: '20px' }}>
                                            <div className="timeline-date" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                                                <div className="month">{new Date(lab.requestedAt).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="day">{new Date(lab.requestedAt).getDate()}</div>
                                                <div className="year">{new Date(lab.requestedAt).getFullYear()}</div>
                                            </div>
                                            <div className="timeline-content" style={{ borderColor: '#BFDBFE' }}>
                                                <div className="timeline-header">
                                                    <h4>Lab Test Request</h4>
                                                    <span className="status-badge-sm" style={{ fontSize: '0.7rem' }}>{lab.status}</span>
                                                </div>
                                                <div className="soap-block">
                                                    <div className="soap-item"><strong>Test:</strong> {lab.testType}</div>
                                                    <div className="soap-item"><strong>Priority:</strong> {lab.priority}</div>
                                                    {lab.notes && <div className="soap-item"><strong>Notes:</strong> {lab.notes}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {vitalsHistory.map(v => (
                                        <div key={v.id} className="timeline-entry" style={{ borderLeft: '3px solid #EF4444', paddingLeft: '1rem', marginLeft: '20px' }}>
                                            <div className="timeline-date" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                                                <div className="month">{new Date(v.recordedAt).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="day">{new Date(v.recordedAt).getDate()}</div>
                                                <div className="year">{new Date(v.recordedAt).getFullYear()}</div>
                                            </div>
                                            <div className="timeline-content" style={{ borderColor: '#FECACA' }}>
                                                <div className="timeline-header">
                                                    <h4>Vitals Recorded</h4>
                                                    <Thermometer size={14} className="text-danger" />
                                                </div>
                                                <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                                    <div className="info-item"><span className="info-label">BP</span><span className="info-value">{v.bloodPressure}</span></div>
                                                    <div className="info-item"><span className="info-label">HR</span><span className="info-value">{v.heartRate}</span></div>
                                                    <div className="info-item"><span className="info-label">SpO2</span><span className="info-value">{v.oxygenSaturation}%</span></div>
                                                    <div className="info-item"><span className="info-label">Temp</span><span className="info-value">{v.temperature}°F</span></div>
                                                    <div className="info-item"><span className="info-label">Height</span><span className="info-value">{v.height}cm</span></div>
                                                    <div className="info-item"><span className="info-label">Weight</span><span className="info-value">{v.weight}kg</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Visit SOAP Form & Prescriptions */}
                <div className="active-visit-col">
                    {appointmentId ? (
                        <div className="card active-visit-card">
                            <div className="panel-header" style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--primary-light)' }}>
                                <h3>Active Clinical Visit</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Reason: {appointment?.reasonForVisit || 'General Consultation'}
                                </p>
                                <div className="action-buttons-top" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button className="btn-action-small danger" onClick={() => setIsDenyModalOpen(true)}>
                                        <Ban size={14} /> Deny Patient
                                    </button>
                                    <button className="btn-action-small warning" onClick={() => setIsTransferModalOpen(true)}>
                                        <Share2 size={14} /> Transfer Case
                                    </button>
                                </div>
                            </div>
                            <div className="panel-body">
                                <h4>SOAP Notes</h4>
                                <div className="soap-form">
                                    <div className="form-group">
                                        <label>Subjective (Patient's complaints)</label>
                                        <textarea className="form-control" rows={2} value={subjective} onChange={(e) => setSubjective(e.target.value)} placeholder="E.g., Patient reports headache for 3 days..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Objective (Clinical findings/Vitals)</label>
                                        <textarea className="form-control" rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="E.g., BP 120/80, Temp 98.6F, clear lungs..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Assessment (Diagnosis)</label>
                                        <textarea className="form-control" rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="E.g., Tension Headache..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Plan (Treatment & Advice)</label>
                                        <textarea className="form-control" rows={2} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="E.g., Rest, hydrate, OTC pain meds..."></textarea>
                                    </div>
                                    <div className="form-group" style={{ width: '50%' }}>
                                        <label>Follow-up Date (Optional)</label>
                                        <input type="date" className="form-control" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                                    </div>
                                </div>

                                <div className="visit-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote || !subjective || !assessment}
                                    >
                                        <Save size={18} />
                                        {isSavingNote ? 'Saving...' : 'Save Clinical Note'}
                                    </button>
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-light)' }}>
                                    <h4>Diagnostic Orders (Labs & Imaging)</h4>
                                    <div className="search-bar" style={{ marginTop: '1rem', position: 'relative' }}>
                                        <Search size={18} className="search-icon" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="Search Tests & Scans (e.g., CBC, X-Ray)..."
                                            value={searchTest}
                                            onChange={(e) => setSearchTest(e.target.value)}
                                        />
                                        {searchTest && (
                                            <div className="search-results">
                                                {diagnosticCatalog.filter(t => t.name.toLowerCase().includes(searchTest.toLowerCase())).slice(0, 5).map(test => (
                                                    <div key={test.id} className="search-result-item" onClick={() => {
                                                        if (!selectedTests.find(t => t.id === test.id)) setSelectedTests([...selectedTests, test]);
                                                        setSearchTest('');
                                                    }}>
                                                        <div>
                                                            <strong>{test.name}</strong> <span style={{ fontSize: '0.8rem', color: 'gray', paddingLeft: '4px' }}>[{test.type}]</span>
                                                        </div>
                                                        <button className="btn-icon"><Plus size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedTests.length > 0 && (
                                        <div className="prescription-list" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {selectedTests.map((test) => (
                                                <div key={test.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                                    <Beaker size={14} className="text-primary" /> {test.name}
                                                    <X size={14} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setSelectedTests(selectedTests.filter(t => t.id !== test.id))} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-light)' }}>
                                    <h4>e-Prescription</h4>

                                    <div className="search-bar" style={{ marginTop: '1rem', position: 'relative' }}>
                                        <Search size={18} className="search-icon" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="Search Pharmacy Catalog..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <div className="search-results">
                                                {filteredMedicines.slice(0, 5).map(med => (
                                                    <div key={med.id} className="search-result-item" onClick={() => handleAddMedicine(med)}>
                                                        <div>
                                                            <strong>{med.name}</strong> <span style={{ fontSize: '0.8rem', color: 'gray' }}>{med.unit}</span>
                                                            <div style={{ fontSize: '0.8rem' }}>{med.category} • {med.currentStock} in stock</div>
                                                        </div>
                                                        <button className="btn-icon"><Plus size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {prescriptionItems.length > 0 && (
                                        <div className="prescription-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {prescriptionItems.map((item, index) => (
                                                <div key={item.medicineId} className="prescription-item" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-main)' }}>
                                                    <div className="item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <strong>{item.name}</strong>
                                                        <button className="text-danger" onClick={() => handleRemoveMedicine(item.medicineId)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><X size={16} /></button>
                                                    </div>
                                                    <div className="item-controls" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                        <div className="form-group" style={{ flex: '1', margin: 0 }}>
                                                            <label>Qty</label>
                                                            <input type="number" min="1" className="form-control" value={item.qty} onChange={(e) => {
                                                                const newItems = [...prescriptionItems];
                                                                newItems[index].qty = parseInt(e.target.value) || 1;
                                                                setPrescriptionItems(newItems);
                                                            }} />
                                                        </div>
                                                        <div className="form-group" style={{ flex: '2', margin: 0 }}>
                                                            <label>Instructions</label>
                                                            <input type="text" className="form-control" value={item.instructions} onChange={(e) => {
                                                                const newItems = [...prescriptionItems];
                                                                newItems[index].instructions = e.target.value;
                                                                setPrescriptionItems(newItems);
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="visit-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                                        <button
                                            className="btn-primary"
                                            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', backgroundColor: 'var(--success)' }}
                                            disabled={isSubmittingPrescription}
                                            onClick={handleSubmitPrescriptionAndComplete}
                                        >
                                            {isSubmittingPrescription ? 'Completing...' : 'Complete Visit & Send Orders'}
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--warning)', color: 'var(--warning)' }}
                                            onClick={() => {
                                                setAdmissionReason(assessment || subjective);
                                                setIsAdmissionModalOpen(true);
                                            }}
                                        >
                                            <Bed size={18} style={{ marginRight: '0.5rem' }} />
                                            Request Hospital Admission
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3>No Active Visit</h3>
                            <p>Select an appointment from the dashboard to start a clinical visit.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Admission Request Modal */}
            {isAdmissionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Request Inpatient Admission</h3>
                            <button className="btn-icon" onClick={() => setIsAdmissionModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label>Reason for Admission</label>
                                <textarea 
                                    className="form-control" 
                                    rows={3} 
                                    value={admissionReason} 
                                    onChange={(e) => setAdmissionReason(e.target.value)}
                                    placeholder="Enter clinical reason for admission..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Urgency Level</label>
                                <select className="form-control" value={admissionUrgency} onChange={(e) => setAdmissionUrgency(e.target.value)}>
                                    <option value="ROUTINE">Routine</option>
                                    <option value="URGENT">Urgent</option>
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Preferred Department / Ward</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={admissionDepartment} 
                                    onChange={(e) => setAdmissionDepartment(e.target.value)}
                                    placeholder="e.g., General Medicine, Cardiology..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Care Level Required</label>
                                <select className="form-control" value={admissionCareLevel} onChange={(e) => setAdmissionCareLevel(e.target.value)}>
                                    <option value="GENERAL">General Ward</option>
                                    <option value="ICU">ICU (Intensive Care Unit)</option>
                                    <option value="HDU">HDU (High Dependency Unit)</option>
                                    <option value="VENTILATOR">Ventilator Support Required</option>
                                    <option value="ISOLATION">Isolation Ward</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsAdmissionModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn-primary" 
                                style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }}
                                onClick={handleRequestAdmission}
                                disabled={isSubmittingAdmission || !admissionReason}
                            >
                                {isSubmittingAdmission ? 'Submitting...' : 'Confirm Admission Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deny Appointment Modal */}
            {isDenyModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--danger-light)' }}>
                            <h3 style={{ color: 'var(--danger)' }}>Deny Consultation</h3>
                            <button className="btn-icon" onClick={() => setIsDenyModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Are you sure you want to deny this patient? This will return the appointment to the receptionist's triage queue.
                            </p>
                            <div className="form-group">
                                <label>Reason for Denial</label>
                                <textarea 
                                    className="form-control" 
                                    rows={3} 
                                    value={denyReason} 
                                    onChange={(e) => setDenyReason(e.target.value)}
                                    placeholder="Mention why you are denying (e.g., Case more suited for Cardiology)..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsDenyModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn-primary" 
                                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={handleDenyAppointment}
                                disabled={isSubmittingAction || !denyReason}
                            >
                                {isSubmittingAction ? 'Processing...' : 'Confirm Denial'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Appointment Modal */}
            {isTransferModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--warning-light)' }}>
                            <h3 style={{ color: 'var(--warning)' }}>Transfer Patient</h3>
                            <button className="btn-icon" onClick={() => setIsTransferModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label>Target Department</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={transferDept} 
                                    onChange={(e) => setTransferDept(e.target.value)}
                                    placeholder="e.g., Neurology, Pediatrics..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Doctor Name (Optional)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={transferDoctorId} 
                                    onChange={(e) => setTransferDoctorId(e.target.value)}
                                    placeholder="Enter Doctor Name if known..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes for Receptionist</label>
                                <textarea 
                                    className="form-control" 
                                    rows={2} 
                                    value={transferReason} 
                                    onChange={(e) => setTransferReason(e.target.value)}
                                    placeholder="Instructions for transfer..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsTransferModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn-primary" 
                                style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: 'white' }}
                                onClick={handleTransferAppointment}
                                disabled={isSubmittingAction || !transferDept}
                            >
                                {isSubmittingAction ? 'Transferring...' : 'Confirm Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    .btn-action-small { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
                    .btn-action-small.danger { background: #FEE2E2; color: #DC2626; border-color: #FECACA; }
                    .btn-action-small.danger:hover { background: #DC2626; color: white; }
                    .btn-action-small.warning { background: #FEF3C7; color: #D97706; border-color: #FDE68A; }
                    .btn-action-small.warning:hover { background: #D97706; color: white; }
                    
                    .emr-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
                    @media (max-width: 1024px) { .emr-layout { grid-template-columns: 1fr; } }
                    
                    .patient-info-card { padding: 1.5rem; margin-bottom: 1.5rem; }
                    .patient-info-card h3 { margin-bottom: 1rem; color: var(--text-primary); }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .info-label { display: block; font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 0.25rem; }
                    .info-value { font-size: 0.9375rem; color: var(--text-primary); font-weight: 500; }
                    .history-text { background: var(--bg-main); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; line-height: 1.5; color: var(--text-secondary); white-space: pre-wrap; margin: 0; }

                    .timeline-card { }
                    .timeline-list { display: flex; flex-direction: column; padding: 1.5rem; gap: 1.5rem; }
                    .timeline-entry { display: flex; gap: 1.25rem; }
                    .timeline-date { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; height: 60px; background: #DBEAFE; color: #1E40AF; border-radius: var(--radius-md); font-weight: 700; flex-shrink: 0; }
                    .timeline-date .month { font-size: 0.75rem; text-transform: uppercase; }
                    .timeline-date .day { font-size: 1.25rem; line-height: 1; margin: 2px 0; }
                    .timeline-date .year { font-size: 0.65rem; opacity: 0.8; }
                    
                    .timeline-content { flex: 1; background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; position: relative; }
                    /* Small arrow pointing left */
                    .timeline-content::before { content: ''; position: absolute; left: -6px; top: 20px; width: 10px; height: 10px; background: var(--bg-main); border-left: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); transform: rotate(45deg); }
                    
                    .timeline-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
                    .timeline-header h4 { margin: 0; color: var(--text-primary); font-size: 1.05rem; }
                    .doctor-tag { font-size: 0.75rem; background: white; border: 1px solid var(--border); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); color: var(--text-secondary); font-weight: 500;}
                    
                    .soap-block { display: flex; flex-direction: column; gap: 0.5rem; }
                    .soap-item { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.4; }
                    .soap-item strong { color: var(--text-primary); margin-right: 0.25rem; }
                    
                    .timeline-footer { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed var(--border); display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--primary); font-weight: 500; }

                    .active-visit-card { overflow: hidden; }
                    .panel-body { padding: 1.5rem; }
                    .panel-body h4 { margin-top: 0; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 2px solid var(--primary-light); display: inline-block; padding-bottom: 0.25rem; }
                    
                    .soap-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
                    textarea.form-control { resize: vertical; min-height: 60px; font-family: inherit; }
                    
                    .visit-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border-light); }
                    
                    /* Search Dropdown copied from Dashboard */
                    .search-results { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: white; border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 10; max-height: 250px; overflow-y: auto; }
                    .search-result-item { padding: 0.75rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                    .search-result-item:hover { background-color: var(--bg-hover); }
                    .search-result-item:last-child { border-bottom: none; }
                    .btn-icon { background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.25rem; display: flex; align-items: center;}
                    .btn-icon:hover { background: #DBEAFE; color: #2563EB; border-color: #BFDBFE; }
                `}
            </style>
        </div>
    );
};

export default PatientEMR;
