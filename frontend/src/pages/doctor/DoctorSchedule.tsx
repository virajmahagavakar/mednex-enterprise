import { useState, useEffect } from 'react';
import { DoctorService } from '../../services/doctor.service';
import type { DoctorScheduleDTO, AppointmentResponse } from '../../services/api.types';
import { Calendar, Clock, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

const DoctorSchedule = () => {
    const [schedules, setSchedules] = useState<DoctorScheduleDTO[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State for New Slot
    const [newSlot, setNewSlot] = useState<DoctorScheduleDTO>({
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '17:00:00',
        slotDuration: 30,
        active: true
    });

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [schedulesData, appointmentsData] = await Promise.all([
                DoctorService.getSchedules(),
                DoctorService.getAppointments()
            ]);
            setSchedules(schedulesData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load schedule data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSlot = async () => {
        setIsSaving(true);
        try {
            await DoctorService.saveSchedule(newSlot);
            await fetchData();
            alert("Schedule saved successfully!");
        } catch (error) {
            console.error("Failed to save schedule", error);
            alert("Failed to save schedule.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!confirm("Are you sure you want to delete this schedule slot?")) return;
        try {
            await DoctorService.deleteSchedule(id);
            setSchedules(schedules.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete schedule", error);
            alert("Failed to delete schedule.");
        }
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        // Handle both ISO strings and HH:mm:ss
        if (time.includes('T')) {
            return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return time.substring(0, 5);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Manage Schedule & Appointments</h2>
                    <p className="page-description">Configure your availability and view your agenda</p>
                </div>
            </div>

            <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                {/* Availability Management */}
                <div className="card">
                    <div className="panel-header">
                        <h3><Clock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Working Hours</h3>
                    </div>
                    <div className="panel-body" style={{ padding: '1.5rem' }}>
                        <div className="schedule-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Day of Week</label>
                                <select 
                                    className="form-control" 
                                    value={newSlot.dayOfWeek}
                                    onChange={(e) => setNewSlot({...newSlot, dayOfWeek: e.target.value})}
                                >
                                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                    <label>Start Time</label>
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        value={newSlot.startTime.substring(0, 5)}
                                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value + ':00'})}
                                    />
                                </div>
                                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                    <label>End Time</label>
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        value={newSlot.endTime.substring(0, 5)}
                                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value + ':00'})}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Slot Duration (minutes)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={newSlot.slotDuration}
                                    onChange={(e) => setNewSlot({...newSlot, slotDuration: parseInt(e.target.value)})}
                                />
                            </div>
                            <button className="btn-primary" onClick={handleSaveSlot} disabled={isSaving}>
                                <Plus size={18} /> Add Working Hours
                            </button>
                        </div>

                        <div className="slots-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {schedules.length === 0 ? (
                                <div className="empty-state">
                                    <AlertCircle size={24} color="var(--text-tertiary)" />
                                    <p>No working hours configured.</p>
                                </div>
                            ) : (
                                schedules.map((slot) => (
                                    <div key={slot.id} className="slot-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{slot.dayOfWeek}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)} • {slot.slotDuration}m slots
                                            </div>
                                        </div>
                                        <button className="text-danger" onClick={() => slot.id && handleDeleteSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="card">
                    <div className="panel-header">
                        <h3><Calendar size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> All Appointments</h3>
                    </div>
                    <div className="panel-body" style={{ padding: '0' }}>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading appointments...</td></tr>
                                    ) : appointments.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No appointments found.</td></tr>
                                    ) : (
                                        appointments.map(apt => (
                                            <tr key={apt.id}>
                                                <td>{formatTime(apt.appointmentTime)}</td>
                                                <td style={{ fontWeight: 500 }}>{apt.patientName}</td>
                                                <td style={{ fontSize: '0.85rem' }}>{apt.reasonForVisit || '-'}</td>
                                                <td>
                                                    <span className={`status-badge-sm status-${apt.status.toLowerCase()}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                {`
                    .status-requested { background: #FEF3C7; color: #B45309; }
                    .status-confirmed { background: #DBEAFE; color: #1E40AF; }
                    .status-scheduled { background: #E0F2FE; color: #0369A1; }
                    .status-checked_in { background: #D1FAE5; color: #065F46; }
                    .status-in_progress { background: #ECFDF5; color: #047857; }
                    .status-completed { background: #F3F4F6; color: #374151; }
                    .status-cancelled { background: #FEE2E2; color: #991B1B; }
                `}
            </style>
        </div>
    );
};

export default DoctorSchedule;
