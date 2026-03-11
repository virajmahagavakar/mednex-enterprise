import { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    userRole: string;
    onProfileUpdated: (name: string, contact: string) => void;
}

const ProfileModal = ({ isOpen, onClose, userName, userEmail, userRole, onProfileUpdated }: ProfileModalProps) => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editContact, setEditContact] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [userContact, setUserContact] = useState<string>('Not Provided');

    useEffect(() => {
        if (isOpen) {
            setIsEditingProfile(false);
            fetchProfileDetails();
        }
    }, [isOpen]);

    const fetchProfileDetails = async () => {
        try {
            const profile = await AdminService.getProfile();
            setUserContact(profile.contactNumber || 'Not Provided');
            setEditName(profile.name || '');
            setEditContact(profile.contactNumber || '');
        } catch (e) {
            console.error("Failed to fetch profile details", e);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsSavingProfile(true);
            const updated = await AdminService.updateProfile({ name: editName, contactNumber: editContact });
            setUserContact(updated.contactNumber || 'Not Provided');
            setIsEditingProfile(false);
            onProfileUpdated(updated.name || updated.email, updated.contactNumber || '');
        } catch (e) {
            console.error("Failed to update profile", e);
            alert("Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content profile-modal">
                <div className="modal-header">
                    <h3>My Profile</h3>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="profile-hero">
                        <div className="profile-avatar-large">{userName.charAt(0).toUpperCase()}</div>
                        {!isEditingProfile ? (
                            <h2>{userName}</h2>
                        ) : (
                            <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem', width: '80%' }} />
                        )}
                        <span className="role-badge">{userRole}</span>
                    </div>

                    <div className="profile-details-grid">
                        <div className="detail-group">
                            <label>Email Address</label>
                            <p>{userEmail}</p>
                        </div>
                        <div className="detail-group">
                            <label>Contact Number (Emergency)</label>
                            {!isEditingProfile ? (
                                <p>{userContact}</p>
                            ) : (
                                <input type="text" className="input-field" value={editContact} onChange={(e) => setEditContact(e.target.value)} placeholder="Phone Number" style={{ width: '100%', padding: '0.25rem 0.5rem' }} />
                            )}
                        </div>
                        <div className="detail-group">
                            <label>Assigned Role</label>
                            <p>{userRole}</p>
                        </div>
                        <div className="detail-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Hospital Hierarchy Access</label>
                            <p>{userRole === 'Hospital Admin' ? 'All Branches (View Only), Main Branch (Full Access)' : 'Role specific system access'}</p>
                        </div>
                        <div className="detail-group">
                            <label>Account Status</label>
                            <p className="status-active">Active</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    {!isEditingProfile ? (
                        <>
                            <button className="btn-outline" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                            <button className="btn-primary" onClick={onClose}>Close</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-outline" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>
                {`
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
            z-index: 1000; display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.2s ease;
          }
          
          .modal-content.profile-modal {
            background-color: white; border-radius: var(--radius-lg);
            width: 100%; max-width: 500px;
            display: flex; flex-direction: column; box-shadow: var(--shadow-xl);
          }
          
          .modal-header {
            padding: 1.5rem; border-bottom: 1px solid var(--border-light);
            display: flex; align-items: center; justify-content: space-between;
          }
          
          .modal-header h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
          
          .modal-body {
            padding: 1.5rem;
          }
          
          .profile-hero {
            display: flex; flex-direction: column; align-items: center; text-align: center;
            margin-bottom: 2rem;
          }
          
          .profile-avatar-large {
            width: 80px; height: 80px; border-radius: 50%;
            background-color: var(--primary-light); color: var(--primary);
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; font-weight: 600; margin-bottom: 1rem;
          }
          
          .profile-hero h2 {
            margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--text-primary);
          }
          
          .role-badge {
            display: inline-block; padding: 0.25rem 0.75rem;
            background-color: #F1F5F9; border: 1px solid #E2E8F0;
            border-radius: 1rem; font-size: 0.75rem; font-weight: 600; color: #475569;
          }
          
          .profile-details-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
            background-color: #FAFCFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);
          }
          
          .detail-group label {
            display: block; font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.25rem;
          }
          
          .detail-group p {
            margin: 0; font-size: 0.875rem; color: var(--text-primary); font-weight: 500;
          }
          
          .status-active { color: var(--success) !important; font-weight: 600 !important; }

          .modal-footer {
            padding: 1.5rem; border-top: 1px solid var(--border-light);
            display: flex; justify-content: flex-end; gap: 1rem;
            background-color: #FAFCFF; border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
            </style>
        </div>
    );
};

export default ProfileModal;
