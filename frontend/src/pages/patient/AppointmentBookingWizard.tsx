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
} from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { DoctorInfoDTO, AvailableSlotDTO, AppointmentBookingRequest } from '../../services/api.types';

export default function AppointmentBookingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1 Data
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [selectedSpec, setSelectedSpec] = useState('');

    // Step 2 Data
    const [doctors, setDoctors] = useState<DoctorInfoDTO[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfoDTO | null>(null);

    // Step 3 Data
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<AvailableSlotDTO[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlotDTO | null>(null);

    // Step 4 Data
    const [reason, setReason] = useState('');

    // Fetch Specializations initially
    useEffect(() => {
        const fetchSpecs = async () => {
            try {
                setLoading(true);
                const data = await PatientService.getAvailableSpecializations();
                setSpecializations(data);
            } catch (err: any) {
                setError(err.response?.data || 'Failed to fetch specializations.');
            } finally {
                setLoading(false);
            }
        };
        fetchSpecs();
    }, []);

    // Fetch doctors when returning to/arriving at step 2
    useEffect(() => {
        if (step === 2 && selectedSpec) {
            const fetchDoctors = async () => {
                try {
                    setLoading(true);
                    const data = await PatientService.getDoctorsBySpecialization(selectedSpec);
                    setDoctors(data);
                } catch (err: any) {
                    setError(err.response?.data || 'Failed to fetch doctors.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDoctors();
        }
    }, [step, selectedSpec]);

    // Fetch slots
    useEffect(() => {
        if (step === 3 && selectedDoctor && selectedDate) {
            const fetchSlots = async () => {
                try {
                    setLoading(true);
                    const data = await PatientService.getDoctorAvailableSlots(selectedDoctor.id, selectedDate);
                    setSlots(data);
                } catch (err: any) {
                    setError(err.response?.data || 'Failed to fetch slots.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSlots();
        }
    }, [step, selectedDoctor, selectedDate]);

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedSlot) return;

        try {
            setLoading(true);
            setError('');

            const payload: AppointmentBookingRequest = {
                doctorId: selectedDoctor.id,
                appointmentTime: selectedSlot.time,
                reasonForVisit: reason
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
        return (
            <div className="mb-8 flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-[var(--background-color)]">
                    <div
                        className="h-full bg-[var(--primary-color)] transition-all duration-300 ease-in-out"
                        style={{ width: `${((Math.min(step, 4) - 1) / 3) * 100}%` }}
                    />
                </div>
                {[
                    { num: 1, label: 'Specialty' },
                    { num: 2, label: 'Doctor' },
                    { num: 3, label: 'Date & Time' },
                    { num: 4, label: 'Confirm' }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white font-semibold transition-colors duration-300
              ${step >= s.num ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--background-color)] text-gray-400'}
            `}>
                            {step > s.num ? <CheckCircle2 size={20} /> : s.num}
                        </div>
                        <span className={`mt-2 text-sm font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                {step > 1 && step < 5 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center text-[var(--primary-color)] hover:text-green-700 font-medium"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 rounded-md bg-red-100 p-4 text-red-700">
                    {error}
                </div>
            )}

            {step < 5 && renderProgressBar()}

            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                {loading && step !== 5 && (
                    <div className="flex justify-center p-12">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent"></div>
                    </div>
                )}

                {/* STEP 1: Specialization */}
                {!loading && step === 1 && (
                    <div>
                        <h2 className="mb-6 text-xl font-semibold flex items-center">
                            <BriefcaseMedical className="mr-3 h-6 w-6 text-[var(--secondary-color)]" />
                            What type of care do you need?
                        </h2>
                        {specializations.length === 0 ? (
                            <p className="text-gray-500">No specializations available at the moment.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {specializations.map((spec) => (
                                    <button
                                        key={spec}
                                        onClick={() => {
                                            setSelectedSpec(spec);
                                            setStep(2);
                                        }}
                                        className={`flex items-center p-4 rounded-xl border-2 text-left transition-all ${selectedSpec === spec
                                            ? 'border-[var(--primary-color)] bg-green-50 shadow-md'
                                            : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="h-10 w-10 bg-[var(--background-color)] rounded-full flex items-center justify-center mr-4">
                                            <BriefcaseMedical className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800 text-lg">{spec}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Doctor */}
                {!loading && step === 2 && (
                    <div>
                        <h2 className="mb-6 text-xl font-semibold flex items-center">
                            <User className="mr-3 h-6 w-6 text-[var(--secondary-color)]" />
                            Select a {selectedSpec} Specialist
                        </h2>
                        {doctors.length === 0 ? (
                            <p className="text-gray-500">No doctors available for this specialization.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {doctors.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => {
                                            setSelectedDoctor(doc);
                                            setStep(3);
                                        }}
                                        className={`p-5 rounded-xl border-2 text-left transition-all ${selectedDoctor?.id === doc.id
                                            ? 'border-[var(--primary-color)] bg-green-50 shadow-md'
                                            : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{doc.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{doc.qualification}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-1 rounded-md mr-2">{doc.yearsOfExperience}y Exp</span>
                                                    {doc.defaultConsultationFee && <span className="bg-green-50 text-[var(--primary-color)] px-2 py-1 rounded-md">₹{doc.defaultConsultationFee}</span>}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: Time Slot */}
                {!loading && step === 3 && (
                    <div>
                        <h2 className="mb-6 text-xl font-semibold flex items-center">
                            <CalendarIcon className="mr-3 h-6 w-6 text-[var(--secondary-color)]" />
                            Select Date & Time
                        </h2>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                            />
                        </div>

                        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Available Time Slots
                        </h3>

                        {slots.length === 0 ? (
                            <p className="text-gray-500 py-4 bg-gray-50 rounded-lg text-center">No slots available on this date.</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {slots.map((slot) => {
                                    const dateObj = new Date(slot.time);
                                    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-3 rounded-lg text-center transition-all ${!slot.available
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : selectedSlot?.time === slot.time
                                                    ? 'bg-[var(--primary-color)] text-white font-bold shadow-md'
                                                    : 'bg-white border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-green-50'
                                                }`}
                                        >
                                            {timeString}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setStep(4)}
                                disabled={!selectedSlot}
                                className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center"
                            >
                                Continue <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Confirmation */}
                {!loading && step === 4 && selectedDoctor && selectedSlot && (
                    <div>
                        <h2 className="mb-6 text-xl font-semibold flex items-center">
                            <CheckCircle2 className="mr-3 h-6 w-6 text-[var(--secondary-color)]" />
                            Confirm Your Appointment
                        </h2>

                        <div className="bg-[var(--background-color)] rounded-xl p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Doctor</p>
                                    <p className="font-semibold text-lg text-gray-900">{selectedDoctor.name}</p>
                                    <p className="text-gray-600">{selectedDoctor.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                                    <p className="font-semibold text-lg text-gray-900">
                                        {new Date(selectedSlot.time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-[var(--primary-color)] font-bold">
                                        {new Date(selectedSlot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Visit (Optional)
                            </label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                placeholder="Please briefly describe your symptoms or reason for the visit..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleBookAppointment}
                                disabled={loading}
                                className="bg-[var(--secondary-color)] text-gray-900 px-8 py-3 rounded-lg font-bold shadow-md hover:brightness-95 transition-all text-lg"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Success */}
                {step === 5 && (
                    <div className="text-center py-12">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Confirmed!</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            Your appointment has been successfully scheduled. You can view its details in your dashboard.
                        </p>
                        <button
                            onClick={() => navigate('/patient-portal/dashboard')}
                            className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-opacity-90 transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
