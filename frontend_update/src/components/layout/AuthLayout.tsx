

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="auth-container">
            <div className="auth-bg-circle-1"></div>
            <div className="auth-bg-circle-2"></div>

            <div className="auth-image-panel">
                <div>
                    <h2>Mednex<br />Enterprise HMS</h2>
                    <p>
                        The next-generation, multi-tenant hospital management system.
                        Streamlining clinical operations, billing, and patient care into one unified platform.
                    </p>
                </div>
            </div>

            <div className="auth-content">
                <div className="auth-card">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
