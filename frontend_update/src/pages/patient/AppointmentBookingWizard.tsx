import { useState } from 'react';
import { 
    ChevronRight, 
    ChevronLeft, 
    Activity, 
    Clock, 
    CheckCircle2,
    Building2,
    Stethoscope,
    ArrowRight,
    UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/patient.service';
import type { AppointmentBookingRequest } from '../../services/api.types';

const departments = [
    { id: 'general', name: 'General Physician', icon: UserCircle, description: 'Common cold, fever, general checkups' },
    { id: 'cardiology', name: 'Cardiology', icon: Activity, description: 'Heart related issues & chest pain' },
    { id: 'orthopedics', name: 'Orthopedics', icon: ChevronRight, description: 'Bone, joint, and muscle health' },
    { id: 'dermatology', name: 'Dermatology', icon: Activity, description: 'Skin, hair, and nail conditions' },
    { id: 'pulmonology', name: 'Pulmonology', icon: Activity, description: 'Lungs & breathing disorders' },
];



export default function AppointmentBookingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState<AppointmentBookingRequest>({
        symptoms: '',
        problemDescription: '',
        departmentPreference: '',
        urgencyLevel: 'ROUTINE',
        preferredDate: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await PatientService.bookAppointment(bookingData);
            setStep(4); // Success step
        } catch (err) {
            alert('Failed to submit appointment request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const colors = {
        primary: '#8BAD89',
        secondary: '#64748B',
        border: '#E2E8F0',
        text: '#1E293B',
        textLight: '#64748B',
        bg: '#F8FAFC'
    };

    const StepIndicator = () => (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', justifyContent: 'center' }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ 
                    width: i === step ? '40px' : '12px', 
                    height: '12px', 
                    borderRadius: '6px', 
                    background: i === step ? colors.primary : colors.border,
                    transition: 'all 0.3s'
                }} />
            ))}
        </div>
    );

    return (
        <div style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: colors.text, marginBottom: '0.5rem' }}>Book an Appointment</h1>
                <p style={{ color: colors.textLight }}>Guided triage for personalized medical care</p>
            </div>

            <StepIndicator />

            <div style={{ background: 'white', borderRadius: '2rem', padding: '2.5rem', border: `1px solid ${colors.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.4s' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <Building2 color={colors.primary} /> Select Department
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                            {departments.map(dept => (
                                <div 
                                    key={dept.id}
                                    onClick={() => {
                                        setBookingData({ ...bookingData, departmentPreference: dept.name });
                                        nextStep();
                                    }}
                                    style={{ 
                                        padding: '1.5rem', 
                                        borderRadius: '1.25rem', 
                                        border: `2px solid ${bookingData.departmentPreference === dept.name ? colors.primary : colors.border}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: bookingData.departmentPreference === dept.name ? `${colors.primary}05` : 'transparent'
                                    }}
                                    className="dept-card"
                                >
                                    <div style={{ color: colors.primary, marginBottom: '1rem' }}>
                                        <Stethoscope size={32} />
                                    </div>
                                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{dept.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: colors.textLight, lineHeight: 1.4 }}>{dept.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.4s' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <Activity color={colors.primary} /> Symptoms & Description
                        </h2>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Primary Symptoms</label>
                            <input 
                                placeholder="e.g. Fever, persistent cough, headache"
                                value={bookingData.symptoms}
                                onChange={e => setBookingData({...bookingData, symptoms: e.target.value})}
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: `1px solid ${colors.border}`, fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Detailed Description (Optional)</label>
                            <textarea 
                                rows={4}
                                placeholder="Tell us more about how you're feeling and when it started..."
                                value={bookingData.problemDescription}
                                onChange={e => setBookingData({...bookingData, problemDescription: e.target.value})}
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: `1px solid ${colors.border}`, fontSize: '1rem', resize: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: colors.textLight, background: 'none', border: 'none', cursor: 'pointer' }}>
                                <ChevronLeft /> Back
                            </button>
                            <button 
                                onClick={nextStep} 
                                disabled={!bookingData.symptoms}
                                style={{ background: colors.primary, color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: bookingData.symptoms ? 1 : 0.5 }}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.4s' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <Clock color={colors.primary} /> Preferences
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Preferred Date</label>
                                <input 
                                    type="date"
                                    value={bookingData.preferredDate}
                                    onChange={e => setBookingData({...bookingData, preferredDate: e.target.value})}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: `1px solid ${colors.border}` }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Urgency Level</label>
                                <select 
                                    value={bookingData.urgencyLevel}
                                    onChange={e => setBookingData({...bookingData, urgencyLevel: e.target.value as any})}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: `1px solid ${colors.border}` }}
                                >
                                    <option value="ROUTINE">Routine Checkup</option>
                                    <option value="URGENT">Urgent Care</option>
                                    <option value="EMERGENCY">Emergency (Need immediate help)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: colors.bg, borderRadius: '1.25rem', marginBottom: '2.5rem' }}>
                            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', color: colors.secondary, textTransform: 'uppercase' }}>Review Summary</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textLight }}>Department</span>
                                    <span style={{ fontWeight: 600 }}>{bookingData.departmentPreference}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textLight }}>Primary Symptom</span>
                                    <span style={{ fontWeight: 600 }}>{bookingData.symptoms}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textLight }}>Preferred Date</span>
                                    <span style={{ fontWeight: 600 }}>{new Date(bookingData.preferredDate!).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: colors.textLight, background: 'none', border: 'none', cursor: 'pointer' }}>
                                <ChevronLeft /> Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                style={{ background: colors.primary, color: 'white', padding: '1rem 3rem', borderRadius: '1rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'scaleIn 0.5s' }}>
                        <div style={{ width: '80px', height: '80px', background: `${colors.primary}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, margin: '0 auto 2rem' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Request Received!</h2>
                        <p style={{ color: colors.textLight, fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            Your appointment request has been sent for triage. Our receptionist will assign the best doctor for your symptoms and confirm the time slot soon.
                        </p>
                        <button 
                            onClick={() => navigate('/patient-portal/appointments')}
                            style={{ background: colors.primary, color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                        >
                            Track Status <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .dept-card:hover { transform: translateY(-4px); border-color: ${colors.primary} !important; box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
}
