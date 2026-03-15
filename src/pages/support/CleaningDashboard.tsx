import React, { useState, useEffect } from 'react';
import InfrastructureService from '../../services/InfrastructureService';
import '../../styles/enterprise-components.css';
import { 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Trash2, 
    RefreshCcw, 
    Navigation2, 
    ShieldCheck 
} from 'lucide-react';

interface CleaningTask {
    id: string;
    bedId: string;
    bedNumber: string;
    roomNumber: string;
    wardName: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    requestedTime: string;
}

const CleaningDashboard: React.FC = () => {
    const [tasks, setTasks] = useState<CleaningTask[]>([]);

    useEffect(() => {
        // Mock data
        setTasks([
            {
                id: '1',
                bedId: 'bed-101',
                bedNumber: '101-A',
                roomNumber: '101',
                wardName: 'General Ward',
                priority: 'HIGH',
                status: 'PENDING',
                requestedTime: new Date(Date.now() - 1000 * 60 * 45).toISOString()
            },
            {
                id: '2',
                bedId: 'bed-205',
                bedNumber: '205-B',
                roomNumber: '205',
                wardName: 'ICU',
                priority: 'HIGH',
                status: 'IN_PROGRESS',
                requestedTime: new Date(Date.now() - 1000 * 60 * 15).toISOString()
            }
        ]);
    }, []);

    const handleComplete = async (taskId: string) => {
        try {
            await InfrastructureService.completeCleaning(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="enterprise-page">
            <div className="enterprise-header">
                <div>
                    <h1>
                        <Trash2 className="text-primary" size={36} />
                        Housekeeping Hub
                    </h1>
                    <p>Manage room sterilization and bed preparation tasks</p>
                </div>
                <div className="enterprise-badge status-available" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation2 size={18} />
                    On Duty
                </div>
            </div>

            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending</p>
                    <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0' }}>{tasks.filter(t => t.status === 'PENDING').length}</h3>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase' }}>In Progress</p>
                    <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0' }}>{tasks.filter(t => t.status === 'IN_PROGRESS').length}</h3>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>Avg. Turnaround</p>
                    <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0' }}>22m</h3>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Active Cleaning Requests</h2>
                {tasks.map(task => (
                    <div key={task.id} className="enterprise-card" style={{ flexDirection: 'row', minHeight: '140px' }}>
                        <div style={{ width: '6px', background: task.priority === 'HIGH' ? 'var(--danger)' : 'var(--warning)' }}></div>
                        <div className="enterprise-card-content">
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <span className="enterprise-badge" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>{task.wardName}</span>
                                <span className={`enterprise-badge ${task.status === 'IN_PROGRESS' ? 'status-in-use' : 'status-maintenance'}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Bed {task.bedNumber}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Room {task.roomNumber}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Clock size={16} />
                                    <span>Requested {new Date(task.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {task.priority === 'HIGH' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 600 }}>
                                        <AlertTriangle size={16} />
                                        <span>Stat Priority</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div style={{ width: '220px', background: 'var(--bg-main)', borderLeft: '1px solid var(--border-light)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                            {task.status === 'PENDING' ? (
                                <button className="btn-primary" style={{ width: '100%', background: '#3B82F6', border: 'none' }}>
                                    Start Task
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleComplete(task.id)}
                                    className="btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <ShieldCheck size={20} />
                                    Mark as Ready
                                </button>
                            )}
                            <button className="link-btn" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Reassign Task</button>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="empty-state" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                        <CheckCircle2 size={60} style={{ color: 'var(--success)', opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>All clear! No pending cleaning tasks.</p>
                        <button className="btn-secondary" style={{ marginTop: '1.5rem', marginInline: 'auto' }}>
                            <RefreshCcw size={16} />
                            Refresh Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CleaningDashboard;
