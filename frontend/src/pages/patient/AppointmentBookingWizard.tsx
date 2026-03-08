import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Calendar as CalendarIcon,
    Clock,
    BriefcaseMedical,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Stethoscope,
    Star,
    Award,
    CalendarCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { DoctorInfoDTO, AvailableSlotDTO, AppointmentBookingRequest } from '../../services/api.types';

export default function AppointmentBookingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Specialty
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [selectedSpec, setSelectedSpec] = useState('');

    // Step 2: Symptoms
    const [symptoms, setSymptoms] = useState('');
    const [problemDescription, setProblemDescription] = useState('');
    const [reason, setReason] = useState('');

    // Step 3: Preferences (Optional)
    const [doctors, setDoctors] = useState<DoctorInfoDTO[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfoDTO | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [slots, setSlots] = useState<AvailableSlotDTO[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlotDTO | null>(null);

    // Styles & Constants
    const colors = {
        primary: '#8BAD89', // Healing Green
        secondary: '#C4B0FF', // Light Purple
        accent: '#F7F8F3', // Beige
        success: '#198038',
        bg: '#F7F8F3', // Beige
        surface: '#FFFFFF',
        text: '#161616',
        textLight: '#525252',
        border: '#E2E8F0'
    };

    // Fetch Specializations
    useEffect(() => {
        const fetchSpecs = async () => {
            try {
                setLoading(true);
                const data = await PatientService.getAvailableSpecializations();
                setSpecializations(data);
            } catch (err: any) {
                setError('Failed to fetch specializations.');
            } finally {
                setLoading(false);
            }
        };
        fetchSpecs();
    }, []);

    // Fetch doctors for preferences
    useEffect(() => {
        if (selectedSpec) {
            const fetchDoctors = async () => {
                try {
                    const data = await PatientService.getDoctorsBySpecialization(selectedSpec);
                    setDoctors(data);
                } catch (err) {
                    console.error('Failed to fetch doctors');
                }
            };
            fetchDoctors();
        }
    }, [selectedSpec]);

    // Fetch slots if doctor and date selected
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchSlots = async () => {
                try {
                    setLoading(true);
                    const data = await PatientService.getDoctorAvailableSlots(selectedDoctor.id, selectedDate);
                    setSlots(data);
                } catch (err) {
                    setError('Failed to fetch slots.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const handleBookAppointment = async () => {
        try {
            setLoading(true);
            setError('');

            const payload: AppointmentBookingRequest = {
                departmentPreference: selectedSpec,
                problemDescription: problemDescription,
                symptoms: symptoms,
                preferredDate: selectedDate || undefined,
                doctorId: selectedDoctor?.id,
                appointmentTime: selectedSlot?.time
            };

            await PatientService.bookAppointment(payload);
            setStep(5); // Success step
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = () => {
        const steps = [
            { num: 1, label: 'Department', icon: <Stethoscope size={18} /> },
            { num: 2, label: 'Symptoms', icon: <BriefcaseMedical size={18} /> },
            { num: 3, label: 'Preferences', icon: <Star size={18} /> },
            { num: 4, label: 'Review', icon: <CheckCircle2 size={18} /> }
        ];

        return (
            <div style={{ marginBottom: '3rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ position: 'absolute', top: '20px', left: '50px', right: '50px', height: '2px', background: '#E2E8F0', zIndex: -1 }} />
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50px',
                        width: `calc(${(Math.min(step, 4) - 1) / (steps.length - 1) * 100}% - ${step === 4 ? '100px' : '0px'})`,
                        height: '2px',
                        background: colors.primary,
                        transition: 'width 0.5s ease',
                        zIndex: -1
                    }} />

                    {steps.map((s) => (
                        <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: step > s.num ? 'pointer' : 'default' }} onClick={() => step > s.num && setStep(s.num)}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: step >= s.num ? colors.primary : '#FFF',
                                border: `2px solid ${step >= s.num ? colors.primary : '#E2E8F0'}`,
                                color: step >= s.num ? '#FFF' : '#A0AEC0',
                                transition: 'all 0.3s ease',
                                boxShadow: step === s.num ? `0 0 0 4px ${colors.primary}20` : 'none'
                            }}>
                                {step > s.num ? <CheckCircle2 size={20} /> : s.icon}
                            </div>
                            <span style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: step >= s.num ? 600 : 500, color: step >= s.num ? colors.primary : '#A0AEC0' }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem' }}>
                        Book Appointment
                    </h1>
                    <p style={{ color: colors.textLight, fontSize: '1rem' }}>
                        {step === 1 && "Start by selecting the medical department."}
                        {step === 2 && "Tell us more about your health concerns."}
                        {step === 3 && "Optional: Choose a preferred doctor or time."}
                        {step === 4 && "Review your request before sending to triage."}
                    </p>
                </div>
                {step > 1 && step < 5 && (
                    <button onClick={() => setStep(step - 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.primary, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                )}
            </div>

            {error && <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', marginBottom: '2rem', color: '#B91C1C', display: 'flex', gap: '0.5rem' }}><AlertCircle size={20} />{error}</div>}

            {step < 5 && renderProgressBar()}

            <div style={{ background: '#FFF', borderRadius: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', padding: '2.5rem', minHeight: '400px', position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: '1.25rem' }}>
                        <Loader2 size={40} color={colors.primary} className="animate-spin" />
                    </div>
                )}

                {/* STEP 1: Department Selection */}
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.5s ease', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {specializations.map((spec) => (
                            <button key={spec} onClick={() => { setSelectedSpec(spec); setStep(2); }} className="booking-card" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', background: '#FFF', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${colors.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                    <Stethoscope size={24} />
                                </div>
                                <span style={{ fontWeight: 600, color: colors.text }}>{spec}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 2: Symptoms & Description */}
                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Core Symptoms</label>
                            <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="E.g. Fever, Cough, Chest Pain" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Detailed Description</label>
                            <textarea value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="Please describe when it started and any other details..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', minHeight: '150px', outline: 'none' }} />
                        </div>
                        <button onClick={() => setStep(3)} disabled={!symptoms || !problemDescription} style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: colors.primary, color: '#FFF', fontWeight: 700, cursor: 'pointer', opacity: (!symptoms || !problemDescription) ? 0.6 : 1 }}>
                            Continue to Preferences
                        </button>
                    </div>
                )}

                {/* STEP 3: Preferences (Optional) */}
                {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Preferred Doctor (Optional)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {doctors.map(doc => (
                                        <button key={doc.id} onClick={() => setSelectedDoctor(selectedDoctor?.id === doc.id ? null : doc)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `2px solid ${selectedDoctor?.id === doc.id ? colors.primary : '#E2E8F0'}`, background: '#FFF', textAlign: 'left', cursor: 'pointer' }}>
                                            <p style={{ fontWeight: 600 }}>Dr. {doc.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: colors.textLight }}>{doc.qualification}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Preferred Date (Optional)</h3>
                                <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', marginBottom: '1rem' }} />
                                {selectedDate && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        {slots.map(slot => (
                                            <button key={slot.time} onClick={() => setSelectedSlot(slot)} style={{ padding: '0.5rem', borderRadius: '0.4rem', border: `1px solid ${selectedSlot?.time === slot.time ? colors.primary : '#E2E8F0'}`, background: selectedSlot?.time === slot.time ? colors.primary : '#FFF', color: selectedSlot?.time === slot.time ? '#FFF' : colors.text, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => setStep(4)} style={{ padding: '1rem 3rem', borderRadius: '0.75rem', background: colors.primary, color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>
                                Review Request
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Review */}
                {step === 4 && (
                    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: colors.textLight }}>DEPARTMENT</p>
                                <p style={{ fontWeight: 600 }}>{selectedSpec}</p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: colors.textLight }}>SYMPTOMS</p>
                                <p style={{ fontWeight: 600 }}>{symptoms}</p>
                            </div>
                            {selectedDoctor && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: colors.textLight }}>PREFERRED DOCTOR</p>
                                    <p style={{ fontWeight: 600 }}>Dr. {selectedDoctor.name}</p>
                                </div>
                            )}
                            {selectedSlot && (
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: colors.textLight }}>PREFERRED TIME</p>
                                    <p style={{ fontWeight: 600 }}>{new Date(selectedSlot.time).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleBookAppointment} style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', background: colors.primary, color: '#FFF', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 16px ${colors.primary}30` }}>
                            Submit Request to Triage
                        </button>
                    </div>
                )}

                {/* STEP 5: Success */}
                {step === 5 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DEFBE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.success, margin: '0 auto 1.5rem' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Request Submitted</h2>
                        <p style={{ color: colors.textLight, marginBottom: '2rem' }}>Your request has been sent to the triage department. A receptionist will assign a doctor and confirm your schedule shortly.</p>
                        <button onClick={() => navigate('/patient-portal/appointments')} style={{ padding: '0.8rem 2rem', borderRadius: '0.75rem', background: colors.primary, color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>
                            View My Requests
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                
                .booking-card:hover { 
                    border-color: ${colors.primary} !important; 
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    transform: translateY(-2px); 
                    transition: all 0.2s; 
                }
                
                input:focus, textarea:focus {
                    border-color: ${colors.primary} !important;
                    box-shadow: 0 0 0 4px ${colors.primary}15 !important;
                }
            `}</style>
        </div>
    );
}
