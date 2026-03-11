import React, { useState, useEffect } from 'react';
import '../../styles/enterprise-components.css';
import { 
    Monitor, 
    Calendar, 
    Wrench,
    History
} from 'lucide-react';

interface MaintenanceTask {
    id: string;
    assetName: string;
    serialNumber: string;
    location: string;
    taskType: 'PREVENTIVE' | 'REPAIR' | 'CALIBRATION';
    priority: 'CRITICAL' | 'NORMAL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate: string;
}

const MaintenanceDashboard: React.FC = () => {
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

    useEffect(() => {
        setTasks([
            {
                id: 'm1',
                assetName: 'GE Healthcare ECG',
                serialNumber: 'GE-ECG-4452',
                location: 'Room 202 (ICU)',
                taskType: 'CALIBRATION',
                priority: 'NORMAL',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
            },
            {
                id: 'm2',
                assetName: 'Draeger Ventilator',
                serialNumber: 'DR-V-881',
                location: 'Main Storage',
                taskType: 'REPAIR',
                priority: 'CRITICAL',
                status: 'IN_PROGRESS',
                dueDate: new Date().toISOString()
            }
        ]);
    }, []);

    return (
        <div className="enterprise-page">
            <div className="enterprise-header">
                <div>
                    <h1>
                        <Wrench className="text-primary" size={36} />
                        Biomedical Service Hub
                    </h1>
                    <p>Maintenance, calibration, and repair management</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={18} />
                        History
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} />
                        Schedule Service
                    </button>
                </div>
            </div>

            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <StatusCard label="Critical Repairs" count={1} color="danger" />
                <StatusCard label="Active Tasks" count={1} color="primary" />
                <StatusCard label="Due Today" count={1} color="warning" />
                <StatusCard label="Compliance" count="98%" color="success" />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="enterprise-table">
                    <thead>
                        <tr>
                            <th>Asset & SN</th>
                            <th>Location</th>
                            <th>Task Type</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)' }}>
                                            <Monitor size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{task.assetName}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', margin: 0 }}>{task.serialNumber}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{task.location}</p>
                                </td>
                                <td>
                                    <span className="enterprise-badge" style={{ background: 'var(--bg-main)', color: 'var(--text-tertiary)' }}>
                                        {task.taskType}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: task.priority === 'CRITICAL' ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(task.status) }}></div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.status.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="link-btn" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Update</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tasks.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No active maintenance tasks.
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusCard = ({ label, count, color }: { label: string, count: any, color: string }) => {
    const colorVar = `var(--${color})`;
    return (
        <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: color === 'primary' ? 'var(--primary)' : colorVar }}>{count}</h3>
        </div>
    );
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'PENDING': return 'var(--warning)';
        case 'IN_PROGRESS': return '#3B82F6';
        case 'COMPLETED': return 'var(--success)';
        default: return 'var(--border)';
    }
}

export default MaintenanceDashboard;
