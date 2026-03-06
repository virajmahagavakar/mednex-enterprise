import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientAppointmentResponseDTO } from '../../services/api.types';

export default function MedicalRecords() {
    const [records, setRecords] = useState<PatientAppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<PatientAppointmentResponseDTO | null>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const data = await PatientService.getPatientAppointments();
                // Filter only past completed or scheduled if needed, but for "Medical Records" we usually want COMPLETED ones with prescriptions
                // Or we just show all past appointments
                setRecords(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch medical records.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="mb-6 rounded-md bg-red-100 p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records & Prescriptions</h1>
                <p className="text-gray-600">View your past appointment history, doctor's notes, and prescriptions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Records List Sidebar */}
                <div className="lg:col-span-1 border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-800 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Visit History
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {records.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No records found.</div>
                        ) : (
                            records.map((record) => {
                                const dateObj = new Date(record.appointmentTime);
                                return (
                                    <button
                                        key={record.id}
                                        onClick={() => setSelectedRecord(record)}
                                        className={`w-full text-left p-4 mb-2 rounded-lg transition-colors ${selectedRecord?.id === record.id
                                            ? 'bg-green-50 border border-[var(--primary-color)]'
                                            : 'bg-white border border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-gray-900">{dateObj.toLocaleDateString()}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${record.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                record.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">Dr. {record.doctorName}</div>
                                        <div className="text-xs text-gray-400 truncate">{record.specialization}</div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Record Details View */}
                <div className="lg:col-span-2">
                    {selectedRecord ? (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-[600px] flex flex-col">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                                        Visit Summary
                                        {selectedRecord.status === 'COMPLETED' && (
                                            <CheckCircle2 className="w-5 h-5 ml-2 text-green-500" />
                                        )}
                                    </h2>
                                    <p className="text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(selectedRecord.appointmentTime).toLocaleString(undefined, {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900 flex items-center justify-end">
                                        <User className="w-4 h-4 mr-1" />
                                        Dr. {selectedRecord.doctorName}
                                    </div>
                                    <div className="text-sm text-[var(--primary-color)]">{selectedRecord.specialization}</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* Reason for Visit */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason for Visit</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                                        {selectedRecord.reasonForVisit || <span className="text-gray-400 italic">Not specified</span>}
                                    </div>
                                </div>

                                {/* Doctor's Notes */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Doctor's Notes</h3>
                                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap min-h-[100px]">
                                        {selectedRecord.notes || <span className="text-gray-400 italic">No notes recorded yet.</span>}
                                    </div>
                                </div>

                                {/* Prescription */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Prescription
                                    </h3>
                                    <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap min-h-[100px]">
                                        {selectedRecord.prescription || <span className="text-gray-400 italic">No prescription issued.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-[600px] flex flex-col items-center justify-center text-gray-500">
                            <FileText className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Select a record</p>
                            <p className="text-sm">Choose a visit from the left menu to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
