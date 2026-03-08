import { useState, useEffect } from 'react';
import { DoctorService } from '../../services/doctor.service';
import type { AdmissionDTO, DailyRoundDTO } from '../../services/api.types';
import { Activity, Clock, FileText, User } from 'lucide-react';

const IPDDashboard = () => {
    const [admissions, setAdmissions] = useState<AdmissionDTO[]>([]);
    const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDTO | null>(null);
    const [dailyRounds, setDailyRounds] = useState<DailyRoundDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [noteContent, setNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        setIsLoading(true);
        try {
            const data = await DoctorService.getAdmissionsByDoctor();
            setAdmissions(data);
            if (data.length > 0 && !selectedAdmission) {
                handleSelectAdmission(data[0]);
            }
        } catch (error) {
            console.error("Failed to load admissions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAdmission = async (admission: AdmissionDTO) => {
        setSelectedAdmission(admission);
        setNoteContent('');
        try {
            const rounds = await DoctorService.getDailyRounds(admission.id);
            setDailyRounds(rounds);
        } catch (error) {
            console.error("Failed to load daily rounds", error);
        }
    };

    const handleSaveRound = async () => {
        if (!selectedAdmission || !noteContent.trim()) return;
        setIsSaving(true);
        try {
            const newRound = await DoctorService.addDailyRound(selectedAdmission.id, { clinicalNotes: noteContent });
            setDailyRounds([...dailyRounds, newRound]);
            setNoteContent('');
        } catch (error) {
            console.error("Failed to save daily round", error);
            alert("Failed to save note.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (isoStr?: string) => {
        if (!isoStr) return 'N/A';
        return new Date(isoStr).toLocaleString();
    };

    if (isLoading && admissions.length === 0) return <div className="p-4" style={{ padding: '2rem', textAlign: 'center' }}>Loading IPD Patients...</div>;

    return (
        <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>IPD Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage admit patients and log daily rounds.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-main)', fontWeight: 600 }}>
                        My Admitted Patients
                    </div>
                    {admissions.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No patients currently admitted under your care.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {admissions.map(adm => (
                                <div
                                    key={adm.id}
                                    onClick={() => handleSelectAdmission(adm)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedAdmission?.id === adm.id ? 'var(--bg-hover)' : 'white',
                                        borderLeft: selectedAdmission?.id === adm.id ? '4px solid var(--primary)' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{adm.patientName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span>Ward: {adm.wardName || 'Unassigned'}</span>
                                        <span>•</span>
                                        <span>Bed: {adm.bedNumber || 'Unassigned'}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                                        Admitted: {new Date(adm.admissionDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedAdmission && (
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={24} color="var(--primary)" />
                                    {selectedAdmission.patientName}
                                </h2>
                                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Bed: {selectedAdmission.bedNumber} ({selectedAdmission.wardName})
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <div><strong>Admission ID:</strong> {selectedAdmission.id.split('-')[0]}</div>
                                <div><strong>Date Admitted:</strong> {formatDate(selectedAdmission.admissionDate)}</div>
                                <div><strong>Admitting Dr.:</strong> {selectedAdmission.admittingDoctorName}</div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                <strong>Reason for Admission:</strong>
                                <p style={{ marginTop: '0.5rem', margin: 0, color: 'var(--text-main)' }}>{selectedAdmission.reasonForAdmission}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <FileText size={20} color="var(--text-tertiary)" />
                                Daily Rounds
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {dailyRounds.length === 0 ? (
                                    <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '1rem', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>No daily rounds recorded yet.</div>
                                ) : (
                                    dailyRounds.map(round => (
                                        <div key={round.id} style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <strong>{round.doctorName}</strong>
                                                <span>{formatDate(round.roundDate)}</span>
                                            </div>
                                            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                {round.clinicalNotes}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Add New Round Note</h4>
                                <textarea
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-input)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        marginBottom: '1rem'
                                    }}
                                    placeholder="Enter clinical assessment, vitals, plan, etc."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                ></textarea>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn-primary"
                                        disabled={isSaving || !noteContent.trim()}
                                        onClick={handleSaveRound}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Round Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>
                {`
                    .btn-primary { padding: 0.5rem 1rem; border: none; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; transition: all 0.2s; background: var(--primary); color: white; }
                    .btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
                    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                `}
            </style>
        </div>
    );
};

export default IPDDashboard;
