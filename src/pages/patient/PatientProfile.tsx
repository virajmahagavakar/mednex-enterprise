import React, { useState, useEffect } from 'react';
import { User, Activity, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { PatientProfileDTO, PatientProfileUpdateDTO } from '../../services/api.types';
import '../../styles/patient-theme.css';

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError('');
            setSuccessMsg('');

            await PatientService.updateProfile(formData);

            setSuccessMsg('Profile updated successfully!');
            // Reload profile to get latest view
            await loadProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
            // Hide success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="patient-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Activity className="spinner" size={40} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="patient-dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>My Profile</h2>
                    <p>Manage your personal and medical details</p>
                </div>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="stat-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Read-only essential info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
                        <User size={40} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
                            {profile?.firstName} {profile?.lastName}
                        </h3>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            <span><strong>Email:</strong> {profile?.email}</span>
                            <span><strong>Phone:</strong> {profile?.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Update Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                className="form-control"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Blood Group</label>
                            <select
                                className="form-control"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Residential Address</label>
                        <input
                            type="text"
                            className="form-control"
                            name="address"
                            placeholder="Full address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Emergency Contact Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="emergencyContactName"
                                placeholder="Relative / Friend"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Emergency Contact Phone</label>
                            <input
                                type="tel"
                                className="form-control"
                                name="emergencyContactPhone"
                                placeholder="+1234567890"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Medical History / Allergies</label>
                        <textarea
                            className="form-control"
                            name="medicalHistory"
                            rows={4}
                            placeholder="Any known allergies, chronic conditions, or past surgeries..."
                            value={formData.medicalHistory}
                            onChange={handleChange}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSaving}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
                        >
                            {isSaving ? <Activity className="spinner" size={18} /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PatientProfile;
