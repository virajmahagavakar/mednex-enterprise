import React, { useState, useEffect } from 'react';
import { User, Save, AlertCircle, CheckCircle, Loader2, Phone, Mail, MapPin, Heart, UserCheck } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientProfileDTO, PatientProfileUpdateDTO } from '../../services/api.types';

const PatientProfile: React.FC = () => {
    const [profile, setProfile] = useState<PatientProfileDTO | null>(null);
    const [formData, setFormData] = useState<PatientProfileUpdateDTO>({
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalHistory: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await PatientService.getProfile();
            setProfile(data);
            setFormData({
                dateOfBirth: data.dateOfBirth || '',
                gender: data.gender || '',
                bloodGroup: data.bloodGroup || '',
                address: data.address || '',
                emergencyContactName: data.emergencyContactName || '',
                emergencyContactPhone: data.emergencyContactPhone || '',
                medicalHistory: data.medicalHistory || ''
            });
            setError('');
        } catch (err: any) {
            setError('Failed to load profile. Please try again later.');
            console.error('Profile load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError('');
            setSuccessMsg('');
            await PatientService.updateProfile(formData);
            setSuccessMsg('Profile updated successfully!');
            await loadProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        border: '1.5px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        color: '#1e293b',
        background: '#f8fafc',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.4rem',
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Loader2 size={36} color="#8BAD89" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading your profile...</p>
            </div>
        );
    }

    const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() : '?';

    return (
        <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>My Profile</h1>
                <p style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.9rem' }}>Manage your personal and medical information</p>
            </div>

            {/* Alerts */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#b91c1c' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                </div>
            )}
            {successMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#15803d' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{successMsg}</span>
                </div>
            )}

            {/* Profile Card */}
            <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                {/* Hero Banner */}
                <div style={{ background: 'linear-gradient(135deg, #8BAD89 0%, #b5d4b3 50%, #C4B0FF 100%)', padding: '2rem 2rem 0', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '88px', height: '88px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                            border: '3px solid rgba(255,255,255,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 700, color: '#fff',
                            flexShrink: 0, marginBottom: '-1px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}>
                            {initials || <User size={36} color="#fff" />}
                        </div>
                        <div style={{ paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                                {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
                            </h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem' }}>
                                {profile?.email && (
                                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Mail size={13} /> {profile.email}
                                    </span>
                                )}
                                {profile?.phone && (
                                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Phone size={13} /> {profile.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>

                    {/* Section: Basic Info */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <User size={16} color="#8BAD89" />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Information</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Date of Birth</label>
                                <input type="date" style={inputStyle} name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <select style={inputStyle} name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Blood Group</label>
                                <select style={inputStyle} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 2rem' }} />

                    {/* Section: Address */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <MapPin size={16} color="#8BAD89" />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</h3>
                        </div>
                        <div>
                            <label style={labelStyle}>Residential Address</label>
                            <input type="text" style={inputStyle} name="address" placeholder="House No., Street, City, State, ZIP" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 2rem' }} />

                    {/* Section: Emergency Contact */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <UserCheck size={16} color="#8BAD89" />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Contact Name</label>
                                <input type="text" style={inputStyle} name="emergencyContactName" placeholder="Relative or friend's name" value={formData.emergencyContactName} onChange={handleChange} />
                            </div>
                            <div>
                                <label style={labelStyle}>Contact Phone</label>
                                <input type="tel" style={inputStyle} name="emergencyContactPhone" placeholder="+91 98765 43210" value={formData.emergencyContactPhone} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 2rem' }} />

                    {/* Section: Medical History */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <Heart size={16} color="#8BAD89" />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medical History</h3>
                        </div>
                        <div>
                            <label style={labelStyle}>Known allergies, chronic conditions, or past surgeries</label>
                            <textarea
                                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', lineHeight: '1.6' }}
                                name="medicalHistory"
                                rows={4}
                                placeholder="e.g. Allergic to Penicillin, Type 2 Diabetes diagnosed 2018, Appendectomy in 2020..."
                                value={formData.medicalHistory}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                        <button
                            type="submit"
                            disabled={isSaving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 2rem',
                                background: isSaving ? '#a8c5a7' : '#8BAD89',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.625rem',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s, transform 0.1s',
                                boxShadow: '0 4px 14px rgba(139, 173, 137, 0.35)',
                            }}
                        >
                            {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                            {isSaving ? 'Saving…' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input:focus, select:focus, textarea:focus {
                    border-color: #8BAD89 !important;
                    box-shadow: 0 0 0 3px rgba(139, 173, 137, 0.15) !important;
                    background: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default PatientProfile;
