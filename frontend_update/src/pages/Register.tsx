import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, FileText, ArrowRight, CheckCircle2, MapPin, Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { OnboardingService } from '../services/auth.service';
import type { HospitalRegistrationRequest } from '../services/api.types';

const Register = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<HospitalRegistrationRequest>({
        hospitalName: '',
        licenseNumber: '',
        gst: '',
        countryState: '',
        primaryEmail: '',
        adminName: '',
        password: '',
        subscriptionPlan: 'STANDARD',
        subscriptionDuration: 'MONTHLY'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await OnboardingService.registerHospital(formData);
            alert('Registration Successful! Tenant ID: ' + response.tenantId);
            setStep(4); // Success step
        } catch (error) {
            console.error(error);
            alert('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Progress Indicators */}
            <div className="progress-container">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                        <div className="step-circle">{step > s ? <CheckCircle2 size={14} /> : s}</div>
                        <div className="step-label">
                            {s === 1 ? 'Hospital Info' : s === 2 ? 'Admin Setup' : 'Subscription'}
                        </div>
                    </div>
                ))}
                <div className="progress-line" style={{ width: `${(step - 1) * 50}%` }}></div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    {step === 1 ? 'Register your Hospital' :
                        step === 2 ? 'Setup Administrator' :
                            step === 3 ? 'Choose Subscription' : 'Registration Complete!'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {step === 1 ? 'Tell us about your medical facility to get started.' :
                        step === 2 ? 'Create the first hospital administrator account.' :
                            step === 3 ? 'Select the perfect plan for Mednex Enterprise.' :
                                'Your enterprise environment is being provisioned.'}
                </p>
            </div>

            {step === 4 ? (
                <div className="success-state">
                    <div className="success-icon-wrapper">
                        <CheckCircle2 size={64} className="success-icon" />
                    </div>
                    <h2>Welcome to Mednex!</h2>
                    <p>Your hospital workspace has been successfully provisioned.</p>
                    <button
                        className="btn-primary"
                        style={{ marginTop: '2rem' }}
                        onClick={() => navigate('/login')}
                    >
                        Go to Login <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

                    {/* Step 1: Hospital Details */}
                    {step === 1 && (
                        <div className="step-content">
                            <div className="input-group">
                                <label>Hospital/Clinic Name</label>
                                <div className="input-with-icon">
                                    <Building2 size={20} className="input-icon" />
                                    <input type="text" name="hospitalName" required value={formData.hospitalName} onChange={handleChange} className="input-field" placeholder="City Central Hospital" />
                                </div>
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Medical License No.</label>
                                    <div className="input-with-icon">
                                        <FileText size={20} className="input-icon" />
                                        <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleChange} className="input-field" placeholder="MCI-12345" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>GST / Tax ID</label>
                                    <input type="text" name="gst" value={formData.gst} onChange={handleChange} className="input-field" placeholder="Optional" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Country & State</label>
                                <div className="input-with-icon">
                                    <MapPin size={20} className="input-icon" />
                                    <input type="text" name="countryState" required value={formData.countryState} onChange={handleChange} className="input-field" placeholder="New York, USA" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Admin Details */}
                    {step === 2 && (
                        <div className="step-content">
                            <div className="input-group">
                                <label>Administrator Name</label>
                                <div className="input-with-icon">
                                    <User size={20} className="input-icon" />
                                    <input type="text" name="adminName" required value={formData.adminName} onChange={handleChange} className="input-field" placeholder="John Doe" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Official Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={20} className="input-icon" />
                                    <input type="email" name="primaryEmail" required value={formData.primaryEmail} onChange={handleChange} className="input-field" placeholder="admin@hospital.com" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-with-icon">
                                    <Lock size={20} className="input-icon" />
                                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                                </div>
                                <p className="input-hint">Must be at least 8 characters</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Subscription */}
                    {step === 3 && (
                        <div className="step-content">
                            <div className="plan-selector">
                                <label className={`plan-card ${formData.subscriptionPlan === 'STANDARD' ? 'selected' : ''}`}>
                                    <input type="radio" name="subscriptionPlan" value="STANDARD" checked={formData.subscriptionPlan === 'STANDARD'} onChange={handleChange} />
                                    <div className="plan-info">
                                        <h4>Standard Plan</h4>
                                        <p>Up to 3 branches, basic clinical modules.</p>
                                    </div>
                                </label>

                                <label className={`plan-card ${formData.subscriptionPlan === 'ENTERPRISE' ? 'selected' : ''}`}>
                                    <input type="radio" name="subscriptionPlan" value="ENTERPRISE" checked={formData.subscriptionPlan === 'ENTERPRISE'} onChange={handleChange} />
                                    <div className="plan-info">
                                        <h4>Enterprise Plan</h4>
                                        <p>Unlimited branches, advanced RBAC & APIs.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="input-group" style={{ marginTop: '1.5rem' }}>
                                <label>Billing Cycle</label>
                                <select name="subscriptionDuration" value={formData.subscriptionDuration} onChange={handleChange} className="input-field">
                                    <option value="MONTHLY">Monthly Billing</option>
                                    <option value="YEARLY">Yearly Billing (Save 20%)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        {step > 1 && (
                            <button type="button" onClick={handleBack} className="btn-outline">
                                Back
                            </button>
                        )}

                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ flex: 1 }}>
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : step === 3 ? (
                                'Complete Registration'
                            ) : (
                                <>Next Step <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>
            )}

            <div className="auth-footer">
                Already have an enterprise workspace? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in</a>
            </div>

            <style>
                {`
          .progress-container {
            display: flex;
            justify-content: space-between;
            position: relative;
            margin-bottom: 2.5rem;
            max-width: 400px;
            margin-inline: auto;
          }

          .progress-line {
            position: absolute;
            top: 14px;
            left: 0;
            height: 2px;
            background-color: var(--primary);
            z-index: 1;
            transition: width var(--transition-normal);
          }

          .progress-container::before {
            content: '';
            position: absolute;
            top: 14px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--border-light);
            z-index: 0;
          }

          .progress-step {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .step-circle {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: white;
            border: 2px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-tertiary);
            transition: all var(--transition-normal);
          }

          .progress-step.active .step-circle {
            border-color: var(--primary);
            color: var(--primary);
          }

          .progress-step.completed .step-circle {
            background-color: var(--primary);
            border-color: var(--primary);
            color: white;
          }

          .step-label {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-tertiary);
            position: absolute;
            top: 36px;
            white-space: nowrap;
          }

          .progress-step.active .step-label {
            color: var(--primary);
          }

          .input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .input-with-icon {
            position: relative;
          }

          .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-tertiary);
          }

          .input-with-icon .input-field {
            padding-left: 2.75rem;
          }

          .input-hint {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
          }

          .plan-selector {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .plan-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
            border: 2px solid var(--border-light);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .plan-card:hover {
            border-color: var(--border);
          }

          .plan-card.selected {
            border-color: var(--primary);
            background-color: var(--primary-light);
            box-shadow: 0 0 0 1px var(--primary);
          }

          .plan-card input[type="radio"] {
            margin-top: 0.25rem;
            accent-color: var(--primary);
            transform: scale(1.2);
          }

          .plan-info h4 {
            margin: 0 0 0.25rem 0;
            color: var(--text-primary);
            font-size: 1rem;
          }

          .plan-info p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.4;
          }

          .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
          }

          .success-state {
            text-align: center;
            padding: 2rem 0;
            animation: fadeIn 0.5s ease;
          }

          .success-icon-wrapper {
            width: 96px;
            height: 96px;
            background-color: var(--success-bg);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }

          .success-icon {
            color: var(--success);
          }

          .auth-footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .auth-footer a {
            font-weight: 600;
          }

          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}
            </style>
        </AuthLayout>
    );
};

export default Register;
