import { useState, useEffect } from 'react';
import { 
    FileText, 
    Calendar, 
    User, 
    Clock, 
    CheckCircle2, 
    Search, 
    Filter,
    ClipboardList,
    Pill,
    MessageSquare,
    Printer,
    Download,
    CalendarCheck2,
    Stethoscope
} from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientAppointmentResponseDTO } from '../../services/api.types';

export default function MedicalRecords() {
    const [records, setRecords] = useState<PatientAppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<PatientAppointmentResponseDTO | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const data = await PatientService.getPatientAppointments();
                setRecords(data);
                if (data.length > 0) {
                    setSelectedRecord(data[0]);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch medical records.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const filteredRecords = records.filter(record => 
        (record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (record.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (record.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    if (loading) {
        return (
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', opacity: 0.6 }}>
                <div style={{ height: '2.5rem', width: '200px', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', marginBottom: '2rem' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: '100px', backgroundColor: '#f3f4f6', borderRadius: '1rem' }}></div>
                        ))}
                    </div>
                    <div style={{ height: '600px', backgroundColor: '#f9fafb', borderRadius: '2rem' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-theme" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '2.5rem' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                            Medical History & Records
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                            Access your complete clinical history, prescriptions, and follow-up notes.
                        </p>
                    </div>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}>
                        <Download size={18} /> Export Data
                    </button>
                </div>

                {error && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '1rem', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2.2fr', gap: '2rem' }}>
                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input 
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.875rem 1rem 0.875rem 2.75rem', 
                                    borderRadius: '1rem', 
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'white',
                                    outline: 'none',
                                    fontFamily: 'Inter'
                                }}
                            />
                        </div>

                        <div className="custom-scrollbar" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem' }}>
                                <span>Recent Visits</span>
                                <span>{filteredRecords.length} Results</span>
                            </div>

                            {filteredRecords.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px dashed var(--border)' }}>
                                    <ClipboardList size={40} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-tertiary)' }}>No records found</p>
                                </div>
                            ) : (
                                filteredRecords.map((record) => {
                                    const displayDate = record.appointmentTime || record.preferredDate;
                                    const dateObj = displayDate ? new Date(displayDate) : null;
                                    const isActive = selectedRecord?.id === record.id;
                                    return (
                                        <button
                                            key={record.id}
                                            onClick={() => setSelectedRecord(record)}
                                            style={{ 
                                                textAlign: 'left',
                                                padding: '1.25rem',
                                                borderRadius: '1.5rem',
                                                border: isActive ? '2px solid var(--primary)' : '1px solid transparent',
                                                backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                                                boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                    {dateObj ? dateObj.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'TBD'}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '0.625rem', 
                                                    fontWeight: 700, 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '1rem',
                                                    backgroundColor: record.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                                                    color: record.status === 'COMPLETED' ? '#065f46' : '#1e40af'
                                                }}>
                                                    {record.status}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                                {dateObj ? dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) : 'Pending Review'}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Stethoscope size={14} color="var(--primary)" /> {record.doctorName ? `Dr. ${record.doctorName}` : 'Choosing best doctor...'}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ position: 'sticky', top: '2.5rem' }}>
                        {selectedRecord ? (
                            <div className="card" style={{ backgroundColor: 'white', borderRadius: '2.5rem', padding: '0', overflow: 'hidden', minHeight: '650px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)' }}>
                                <div style={{ padding: '2.5rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '1.25rem' }}>
                                                <Calendar size={32} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Session Summary</h2>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                    <Clock size={16} /> 
                                                    {new Date(selectedRecord.appointmentTime).toLocaleString(undefined, {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '1.5rem', border: '1px solid #f3f4f6', backgroundColor: 'white', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={20} color="var(--text-tertiary)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedRecord.doctorName ? `Dr. ${selectedRecord.doctorName}` : 'Medical Board'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedRecord.specialization || 'Triage Ongoing'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, overflowY: 'auto' }}>
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                            <Filter size={14} /> Primary Complaint
                                        </div>
                                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {selectedRecord.reasonForVisit || <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>Not specified</span>}
                                        </div>
                                    </section>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                <MessageSquare size={14} /> Clinical Notes
                                            </div>
                                            <div style={{ padding: '1.5rem', border: '1px solid #f3f4f6', borderRadius: '1.5rem', minHeight: '150px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                                                {selectedRecord.notes || <span style={{ color: 'var(--text-tertiary)' }}>No detailed clinical observations recorded for this visit.</span>}
                                            </div>
                                        </section>

                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                <Pill size={14} /> Prescriptions
                                            </div>
                                            <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '1.5rem', minHeight: '150px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#065f46', fontWeight: 500 }}>
                                                {selectedRecord.prescription || <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>No medication was prescribed during this visit.</span>}
                                            </div>
                                        </section>
                                    </div>

                                    <div style={{ marginTop: 'auto', textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid #f3f4f6', color: 'var(--text-tertiary)', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle2 size={16} color="var(--success)" /> Verified Mednex Clinical Record
                                        <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'white' }}>
                                                <Printer size={12} /> Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'white', borderRadius: '2.5rem', border: '2px dashed var(--border)', height: '650px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', padding: '2rem', textAlign: 'center' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <FileText size={48} color="var(--border)" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Selection</h3>
                                <p style={{ maxWidth: '300px' }}>Choose a visit from the list to view full session details, clinical notes, and prescriptions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-tertiary);
                }
            `}</style>
        </div>
    );
}
