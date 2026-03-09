import React, { useState, useEffect } from 'react';
import { SurgeryService } from '../../services/surgery.service';
import type {
    SurgeryScheduleDTO,
    OperationTheatreDTO,
    SurgeryStatus
} from '../../services/api.types';
import { Calendar, Clock, Activity, Users, Plus, CheckCircle, Stethoscope, Syringe, MoreVertical } from 'lucide-react';

export const OTDashboard = () => {
    const [schedule, setSchedule] = useState<SurgeryScheduleDTO[]>([]);
    const [theatres, setTheatres] = useState<OperationTheatreDTO[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
        try {
            const start = `${selectedDate}T00:00:00`;
            const end = `${selectedDate}T23:59:59`;
            const data = await SurgeryService.getSchedule(start, end);
            setSchedule(data);
        } catch (error) {
            console.error("Failed to load surgery schedule", error);
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
            alert("Error submitting note.");
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
            alert("Error submitting note.");
        }
    };

    const formatTime = (isoDate: string) => {
        return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b-4 border-rose-500 pb-2 inline-block">
                        Operation Theatre (OT) Hub
                    </h1>
                    <p className="text-gray-500 mt-2">Manage daily surgical schedules and intra-operative documentation.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    />
                    <button className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                        <Plus className="w-4 h-4" /> Book OT Slot
                    </button>
                </div>
            </div>

            {/* Theatre Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {theatres.map(theatre => (
                    <div key={theatre.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-rose-100 p-3 rounded-lg text-rose-600">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{theatre.name}</h3>
                                <p className="text-xs text-gray-500">{theatre.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Schedule List */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" /> Surgical Timetable
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {schedule.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 border-dashed border-2 m-4 rounded-xl border-gray-200 bg-gray-50">
                            No surgeries scheduled for this date.
                        </div>
                    ) : schedule.map(surg => (
                        <div key={surg.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-gray-50 transition-colors">
                            {/* Time Column */}
                            <div className="w-32 flex-shrink-0 text-center border-r border-gray-200 pr-6">
                                <div className="text-xl font-bold text-slate-900">{formatTime(surg.scheduledStartTime)}</div>
                                <div className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> {formatTime(surg.scheduledEndTime)}
                                </div>
                            </div>

                            {/* Details Column */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-bold text-gray-900">{surg.procedureName}</h4>
                                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                                        {surg.theatreName}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1.5"><strong className="text-gray-900">Patient:</strong> {surg.patientName}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> <strong className="text-gray-900">Surgeon:</strong> Dr. {surg.primarySurgeonName}</span>
                                    {surg.anesthetistName && (
                                        <span className="flex items-center gap-1.5"><strong className="text-gray-900">Anesthetist:</strong> Dr. {surg.anesthetistName}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions & Status Column */}
                            <div className="flex flex-col items-end gap-3 md:w-48 flex-shrink-0">
                                <select
                                    className={`text-sm font-semibold rounded-md border-0 py-1.5 pl-3 pr-8 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-xs sm:leading-6
                                        ${surg.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-900 ring-amber-300 focus:ring-amber-600' :
                                            surg.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-900 ring-blue-300 focus:ring-blue-600' :
                                                surg.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-900 ring-emerald-300 focus:ring-emerald-600' :
                                                    'bg-gray-50 text-gray-900 ring-gray-300'}`}
                                    value={surg.status}
                                    onChange={(e) => handleUpdateStatus(surg.id, e.target.value as SurgeryStatus)}
                                >
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="IN_PROGRESS">In OT (In Progress)</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>

                                {surg.status === 'COMPLETED' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setActiveSurgeryContext(surg); setSurgicalNoteModalOpen(true); }}
                                            className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                                            title="Add Surgical Note"
                                        >
                                            <Stethoscope className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setActiveSurgeryContext(surg); setAnesthesiaNoteModalOpen(true); }}
                                            className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                            title="Add Anesthesia Note"
                                        >
                                            <Syringe className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Surgical Note Modal */}
            {isSurgicalNoteModalOpen && activeSurgeryContext && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Stethoscope className="text-rose-600" /> Operative Report</h3>
                            <button onClick={() => setSurgicalNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><CheckCircle className="rotate-45" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div className="text-sm bg-blue-50 text-blue-800 p-3 rounded-md mb-4 border border-blue-100">
                                <strong>Patient:</strong> {activeSurgeryContext.patientName} | <strong>Procedure:</strong> {activeSurgeryContext.procedureName}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Operative Diagnosis</label>
                                    <input type="text" value={preOpDiag} onChange={e => setPreOpDiag(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 shadow-sm sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Post-Operative Diagnosis</label>
                                    <input type="text" value={postOpDiag} onChange={e => setPostOpDiag(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 shadow-sm sm:text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Details of Operation Performed <span className="text-red-500">*</span></label>
                                <textarea required rows={4} value={operationPerformed} onChange={e => setOperationPerformed(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 shadow-sm sm:text-sm" placeholder="Detailed narrative of the procedure..."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon's Notes/Findings</label>
                                <textarea rows={2} value={surgeonNotes} onChange={e => setSurgeonNotes(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 shadow-sm sm:text-sm"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complications</label>
                                <input type="text" value={complications} onChange={e => setComplications(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 shadow-sm sm:text-sm" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setSurgicalNoteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={submitSurgicalNote} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md shadow-sm hover:bg-rose-700">Sign & Save Note</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Anesthesia Note Modal */}
            {isAnesthesiaNoteModalOpen && activeSurgeryContext && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Syringe className="text-indigo-600" /> Anesthesia Record</h3>
                            <button onClick={() => setAnesthesiaNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><CheckCircle className="rotate-45" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Anesthesia Type</label>
                                <select value={anesType} onChange={e => setAnesType(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm">
                                    <option>General</option>
                                    <option>Regional (Epidural/Spinal)</option>
                                    <option>Local with MAC</option>
                                    <option>Local Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medications Administered</label>
                                <textarea rows={2} value={medsAdmin} onChange={e => setMedsAdmin(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" placeholder="Propofol, Fentanyl, Rocuronium..."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Vitals Summary</label>
                                <textarea rows={2} value={patientVitals} onChange={e => setPatientVitals(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" placeholder="BP maintained 110/70, HR 60-80, SpO2 99%"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Anesthetist Notes</label>
                                <textarea rows={3} value={anesNotes} onChange={e => setAnesNotes(e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" placeholder="Intubation grade I, smooth extubation..."></textarea>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setAnesthesiaNoteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={submitAnesthesiaNote} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Sign & Save Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
