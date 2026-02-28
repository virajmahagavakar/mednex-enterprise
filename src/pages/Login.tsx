import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Building2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { AuthService } from '../services/auth.service';

const Login = () => {
    const [tenantCode, setTenantCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await AuthService.login({
                email,
                password,
                hospitalId: tenantCode || undefined
            });
            navigate('/admin');
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Welcome back
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Please enter your credentials to access your hospital workspace.
                </p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label htmlFor="tenantCode">Workspace Code (Optional)</label>
                    <div style={{ position: 'relative' }}>
                        <Building2
                            size={20}
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                        />
                        <input
                            id="tenantCode"
                            type="text"
                            className="input-field"
                            placeholder="e.g. city-hospital"
                            style={{ paddingLeft: '2.75rem' }}
                            value={tenantCode}
                            onChange={(e) => setTenantCode(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail
                            size={20}
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                        />
                        <input
                            id="email"
                            type="email"
                            required
                            className="input-field"
                            placeholder="doctor@mednex.com"
                            style={{ paddingLeft: '2.75rem' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                        <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Forgot password?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock
                            size={20}
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                        />
                        <input
                            id="password"
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            style={{ paddingLeft: '2.75rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '2rem' }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            Authenticating...
                        </span>
                    ) : (
                        <>
                            Sign In Here <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Don't have an enterprise account? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ fontWeight: 600 }}>Register Hospital</a>
            </div>

            <style>
                {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </AuthLayout>
    );
};

export default Login;
