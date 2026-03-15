import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LogOut,
    LayoutDashboard,
    Menu,
    Beaker,
    Activity
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/api.client';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    sub: string;
    roles?: string[];
}

const LabLayout = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string>('Lab Technician');
    const [userRole] = useState<string>('Lab Technician');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const token = TokenService.getToken();
        if (!token) {
            navigate('/login');
        } else {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                setUserEmail(decoded.sub || 'Lab Technician');

                if (!decoded.roles?.includes('ROLE_LAB_TECHNICIAN') && !decoded.roles?.includes('ROLE_SUPER_ADMIN')) {
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
        { name: 'Pathology Hub', path: '/lab/dashboard', icon: <Beaker size={20} /> },
        { name: 'Analyzer Integrations', path: '#', icon: <Activity size={20} /> },
    ];

    return (
        <div className="admin-layout flex min-h-screen bg-[#F8FAFC]">
            <aside className="sidebar w-64 bg-indigo-950 text-white flex flex-col z-10">
                <div className="sidebar-header p-6 border-b border-indigo-900">
                    <h2 className="text-xl font-bold tracking-tight">Mednex LAB</h2>
                </div>

                <nav className="sidebar-nav flex-1 py-6 flex flex-col gap-2 px-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer p-6 border-t border-indigo-900">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-indigo-200 hover:text-red-400 font-medium transition-colors w-full">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500"><Menu size={24} /></button>
                        <h1 className="text-lg font-semibold text-gray-800">Laboratory Information System</h1>
                    </div>

                    <div className="relative">
                        <div className="user-profile flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900">{userEmail}</span>
                                <span className="text-xs text-gray-500">{userRole}</span>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                                    <p className="text-xs text-gray-500 truncate">{userRole}</p>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#F8FAFC]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default LabLayout;
