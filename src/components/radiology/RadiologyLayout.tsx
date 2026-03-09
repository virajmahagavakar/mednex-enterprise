import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LogOut,
    Image as ImageIcon,
    Menu,
    Eye
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    sub: string;
    roles?: string[];
}

const RadiologyLayout = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string>('Radiologist');
    const [userRole] = useState<string>('Radiology Dept');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const token = TokenService.getToken();
        if (!token) {
            navigate('/login');
        } else {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                setUserEmail(decoded.sub || 'Radiologist');

                if (!decoded.roles?.includes('ROLE_RADIOLOGIST') && !decoded.roles?.includes('ROLE_SUPER_ADMIN')) {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Modality Search', path: '/radiology/dashboard', icon: <ImageIcon size={20} /> },
        { name: 'WebPACS Viewer', path: '#', icon: <Eye size={20} /> },
    ];

    return (
        <div className="admin-layout flex min-h-screen bg-black">
            <aside className="sidebar w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col z-10">
                <div className="sidebar-header p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold tracking-tight text-white">Mednex RIS</h2>
                </div>

                <nav className="sidebar-nav flex-1 py-6 flex flex-col gap-2 px-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer p-6 border-t border-slate-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 font-medium transition-colors w-full">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500"><Menu size={24} /></button>
                        <h1 className="text-lg font-semibold text-slate-200">Radiology Information System</h1>
                    </div>

                    <div className="relative">
                        <div className="user-profile flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className="w-9 h-9 rounded-full bg-cyan-900/50 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200">{userEmail}</span>
                                <span className="text-xs text-slate-500">{userRole}</span>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 rounded-lg shadow-xl border border-slate-800 z-50">
                                <div className="p-4 border-b border-slate-800">
                                    <p className="text-sm font-bold text-slate-200 line-clamp-1">{userEmail}</p>
                                    <p className="text-xs text-slate-500 truncate">{userRole}</p>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-slate-800 flex items-center gap-2">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default RadiologyLayout;
