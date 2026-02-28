import { useState, useEffect } from 'react';
import type { SubscriptionResponse } from '../../services/api.types';
import { AdminService } from '../../services/admin.service';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const Subscription = () => {
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    setIsLoading(true);
    try {
      const data = await AdminService.getSubscriptionStatus();
      setSub(data);
    } catch (error) {
      console.error("Failed to fetch subscription", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Billing & Subscription</h2>
          <p className="page-description">Manage your Mednex Enterprise subscription plan</p>
        </div>
      </div>

      <div className="subscription-grid">
        {/* Current Plan Overview */}
        <div className="card overview-card">
          <div className="plan-header">
            <div>
              <div className="plan-badge">CURRENT PLAN</div>
              <h3 className="plan-name">{sub?.plan}</h3>
            </div>
            <div className={`status-pill ${sub?.daysLeft && sub.daysLeft > 0 ? 'active' : 'inactive'}`}>
              {sub?.daysLeft && sub.daysLeft > 0 ? (
                <><CheckCircle size={16} /> ACTIVE</>
              ) : (
                <><AlertTriangle size={16} /> EXPIRED</>
              )}
            </div>
          </div>

          <div className="plan-details">
            <div className="detail-item">
              <span className="detail-label">Location / Account</span>
              <span className="detail-value">{sub?.hospitalName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Billing Cycle</span>
              <span className="detail-value">{sub?.duration}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Next Invoice Amount</span>
              <span className="detail-value highlight">
                USD {sub?.costPaid?.toLocaleString()}
                {sub?.discountApplied && <span className="discount-tag">-30% Sub-Branch Discount</span>}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Next Billing Date</span>
              <span className="detail-value">{sub?.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div className="plan-actions">
            <button className="btn-primary" style={{ flex: 1 }}>Renew Plan</button>
            <button className="btn-outline" style={{ flex: 1 }}>View Invoices</button>
          </div>
        </div>

        {/* Features & Upgrades */}
        <div className="card features-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Features Included</h3>

          <ul className="feature-list">
            <li>
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <strong>Unlimited Branches</strong>
                <p>Manage patients across all your hospital locations</p>
              </div>
            </li>
            <li>
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <strong>Advanced RBAC Security</strong>
                <p>Fine-grained permissions for over 50+ staff roles</p>
              </div>
            </li>
            <li>
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <strong>Telemedicine & Portal</strong>
                <p>Patient app access with integrated video consultation</p>
              </div>
            </li>
            <li>
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <strong>Dedicated Support Account Manager</strong>
                <p>24/7 SLA backed enterprise support</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <style>
        {`
          .subscription-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          @media (max-width: 1024px) {
            .subscription-grid {
              grid-template-columns: 1fr;
            }
          }

          .overview-card {
            background: linear-gradient(to bottom right, #ffffff, #f4f7fb);
            border: 1px solid var(--primary-light);
          }

          .plan-header {
            padding: 2rem;
            border-bottom: 1px solid var(--border-light);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .plan-badge {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: var(--primary);
            margin-bottom: 0.5rem;
          }

          .plan-name {
            font-size: 2rem;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.1;
          }

          .status-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .status-pill.active {
            background-color: var(--success-bg);
            color: var(--success);
          }

          .plan-details {
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .detail-label {
            color: var(--text-secondary);
            font-weight: 500;
          }

          .detail-value {
            font-weight: 600;
            color: var(--text-primary);
            text-align: right;
          }

          .detail-value.highlight {
            font-size: 1.25rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .discount-tag {
            font-size: 0.75rem;
            background-color: var(--success-bg);
            color: var(--success);
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
            vertical-align: middle;
          }

          .plan-actions {
            padding: 2rem;
            padding-top: 0;
            display: flex;
            gap: 1rem;
          }

          .features-card {
            padding: 2rem;
          }

          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .feature-list li {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
          }

          .feature-icon {
            color: var(--primary);
            margin-top: 0.125rem;
            flex-shrink: 0;
          }

          .feature-list strong {
            display: block;
            margin-bottom: 0.25rem;
            color: var(--text-primary);
          }

          .feature-list p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.5;
          }
        `}
      </style>
    </div>
  );
};

export default Subscription;
