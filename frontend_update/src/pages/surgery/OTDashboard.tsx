import React, { useState, useEffect } from 'react';
import { SurgeryService } from '../../services/surgery.service';
import type {
    SurgeryScheduleDTO,
    OperationTheatreDTO,
    SurgeryStatus
} from '../../services/api.types';
import { Calendar, Clock, Activity, Users, Plus, CheckCircle, Stethoscope, Syringe, Trash2, Filter, AlertCircle } from 'lucide-react';

export const OTDashboard = () => {
    const [schedule, setSchedule] = useState<SurgeryScheduleDTO[]>([]);
    const [theatres, setTheatres] = useState<OperationTheatreDTO[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);

    // Notes Modal State
    const [activeSurgeryContext, setActiveSurgeryContext] = useState<SurgeryScheduleDTO | null>(null);
    const [isSurgicalNoteModalOpen, setSurgicalNoteModalOpen] = useState(false);
    const [isAnesthesiaNoteModalOpen, setAnesthesiaNoteModalOpen] = useState(false);

    // Surgical Note Form
    const [preOpDiag, setPreOpDiag] = useState('');
    const [postOpDiag, setPostOpDiag] = useState('');
    const [operationPerformed, setOperationPerformed] = useState('');
    const [surgeonNotes, setSurgeonNotes] = useState('');
    const [complications, setComplications] = useState('None');

    // Anesthesia Note Form
    const [anesType, setAnesType] = useState('General');
    const [medsAdmin, setMedsAdmin] = useState('');
    const [patientVitals, setPatientVitals] = useState('');
    const [anesNotes, setAnesNotes] = useState('');

    useEffect(() => {
        fetchTheatres();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [selectedDate]);

    const fetchTheatres = async () => {
        try {
            const data = await SurgeryService.getActiveTheatres();
            setTheatres(data);
        } catch (error) {
            console.error("Failed to load theatres", error);
        }
    };

    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const start = `${selectedDate}T00:00:00`;
            const end = `${selectedDate}T23:59:59`;
            const data = await SurgeryService.getSchedule(start, end);
            setSchedule(data);
        } catch (error) {
            console.error("Failed to load surgery schedule", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: SurgeryStatus) => {
        try {
            await SurgeryService.updateStatus(id, newStatus);
            fetchSchedule();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const submitSurgicalNote = async () => {
        if (!activeSurgeryContext) return;
        try {
            await SurgeryService.addSurgicalNote(activeSurgeryContext.id, {
                preOpDiagnosis: preOpDiag,
                postOpDiagnosis: postOpDiag,
                operationPerformed,
                surgeonNotes,
                complications
            });
            alert('Surgical Note Submitted!');
            setSurgicalNoteModalOpen(false);
        } catch (error) {
            console.error("Failed to submit surgical note", error);
        }
    };

    const submitAnesthesiaNote = async () => {
        if (!activeSurgeryContext) return;
        try {
            await SurgeryService.addAnesthesiaNote(activeSurgeryContext.id, {
                anesthesiaType: anesType,
                medicationsAdministered: medsAdmin,
                patientVitalsSummary: patientVitals,
                anesthetistNotes: anesNotes
            });
            alert('Anesthesia Note Submitted!');
            setAnesthesiaNoteModalOpen(false);
        } catch (error) {
            console.error("Failed to submit anesthesia note", error);
        }
    };

    const formatTime = (isoDate: string) => {
        return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">OT Scheduling Hub</h1>
                    <p className="page-description">Managing surgical units and perioperative documentation.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="btn-secondary"
                            style={{ paddingRight: '1rem', cursor: 'pointer' }}
                        />
                    </div>
                    <button className="btn-primary">
                        <Plus size={18} />
                        <span>Schedule Surgery</span>
                    </button>
                </div>
            </div>

            {/* Theatre Status Summary */}
            <div className="dashboard-stats-grid">
                {theatres.map(theatre => (
                    <div key={theatre.id} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <Activity size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{theatre.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)', animation: 'pulse 2s infinite' }} />
                                <span className="stat-value" style={{ fontSize: '1rem' }}>Active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Schedule Table */}
            <div className="card">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><Calendar size={20} className="text-secondary" /> Daily Surgical Timetable</h3>
                    <div className="status-badge" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                        {selectedDate}
                    </div>
                </div>
                
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Schedule</th>
                                <th>Unit & Procedure</th>
                                <th>Patient/Surgeon</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                                        Loading schedule...
                                    </td>
                                </tr>
                            ) : schedule.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>
                                        <div style={{ marginBottom: '1rem' }}><AlertCircle size={32} style={{ margin: '0 auto' }} /></div>
                                        No surgeries scheduled for this date.
                                    </td>
                                </tr>
                            ) : schedule.map(surg => (
                                <tr key={surg.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatTime(surg.scheduledStartTime)}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <Clock size={12} /> {formatTime(surg.scheduledEndTime)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span className="status-badge-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', alignSelf: 'start' }}>
                                                {surg.theatreName}
                                            </span>
                                            <span style={{ fontWeight: 600 }}>{surg.procedureName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600 }}>{surg.patientName}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sr. Dr. {surg.primarySurgeonName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className="btn-secondary"
                                            style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '0.25rem 0.5rem',
                                                borderColor: surg.status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--border)',
                                                backgroundColor: surg.status === 'IN_PROGRESS' ? 'var(--primary-light)' : 'white'
                                            }}
                                            value={surg.status}
                                            onChange={(e) => handleUpdateStatus(surg.id, e.target.value as SurgeryStatus)}
                                        >
                                            <option value="SCHEDULED">Scheduled</option>
                                            <option value="IN_PROGRESS">In OT</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {surg.status === 'COMPLETED' && (
                                                <>
                                                    <button 
                                                        className="btn-secondaryIcon" 
                                                        title="Surgical Note"
                                                        onClick={() => { setActiveSurgeryContext(surg); setSurgicalNoteModalOpen(true); }}
                                                    >
                                                        <Stethoscope size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn-secondaryIcon" 
                                                        title="Anesthesia Note"
                                                        onClick={() => { setActiveSurgeryContext(surg); setAnesthesiaNoteModalOpen(true); }}
                                                    >
                                                        <Syringe size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="btn-secondaryIcon text-danger"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Surgical Note Modal placeholder (styled in common modal classes if available, otherwise using inline) */}
            {isSurgicalNoteModalOpen && (
                <div style={{ 
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="panel-header">
                            <h3 style={{ gap: '0.75rem' }}><Stethoscope size={20} className="text-danger" /> Surgical Operative Report</h3>
                        </div>
                        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Pre-Op Diagnosis</label>
                                    <input type="text" className="form-control" value={preOpDiag} onChange={e => setPreOpDiag(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Post-Op Diagnosis</label>
                                    <input type="text" className="form-control" value={postOpDiag} onChange={e => setPostOpDiag(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Operation Performed</label>
                                <textarea rows={4} className="form-control" value={operationPerformed} onChange={e => setOperationPerformed(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Surgeon Notes</label>
                                <textarea rows={3} className="form-control" value={surgeonNotes} onChange={e => setSurgeonNotes(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn-secondary" onClick={() => setSurgicalNoteModalOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={submitSurgicalNote}>Sign & Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Anesthesia Note Modal placeholder */}
            {isAnesthesiaNoteModalOpen && (
                <div style={{ 
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '500px' }}>
                        <div className="panel-header">
                            <h3 style={{ gap: '0.75rem' }}><Syringe size={20} className="text-secondary" /> Anesthesia Record</h3>
                        </div>
                        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label>Anesthesia Type</label>
                                <select className="form-control" value={anesType} onChange={e => setAnesType(e.target.value)}>
                                    <option>General</option>
                                    <option>Local with MAC</option>
                                    <option>Regional</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Medications</label>
                                <textarea rows={2} className="form-control" value={medsAdmin} onChange={e => setMedsAdmin(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Patient Vitals Summary</label>
                                <textarea rows={2} className="form-control" value={patientVitals} onChange={e => setPatientVitals(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn-secondary" onClick={() => setAnesthesiaNoteModalOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={submitAnesthesiaNote}>Confirm Record</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
