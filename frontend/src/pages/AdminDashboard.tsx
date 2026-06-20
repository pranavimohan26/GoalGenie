import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { Shield, Users, Target, Activity, Trash2, Mail, Calendar, AlertTriangle } from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageRiskScore: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [highRiskGoals, setHighRiskGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await api.admin.getMetrics();
      setStats(res.stats);
      setRecentUsers(res.recentUsers);
      setHighRiskGoals(res.highRiskGoals);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch admin console metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === 'admin@example.com') {
      alert('Cannot delete the root administrator account!');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user "${email}" and all associated goals?`)) return;
    
    try {
      await api.admin.deleteUser(userId);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Entering Administration Console...</span>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>
          Admin <span className="gradient-text">Console</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Monitor user growth, global platform metrics, and risk reports.
        </p>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '16px', color: 'var(--danger)' }}>
          <span>Error loading admin stats: {error}</span>
        </div>
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid-cols-3">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users size={22} />}
            trend="Active user profiles"
          />
          <MetricCard
            title="Total Roadmap Goals"
            value={stats.totalGoals}
            icon={<Target size={22} />}
            trend={`${stats.activeGoals} active, ${stats.completedGoals} completed`}
            color="var(--secondary)"
          />
          <MetricCard
            title="Average Risk Rating"
            value={`${Math.round(stats.averageRiskScore * 100)}%`}
            icon={<Activity size={22} />}
            trend="Across all active plans"
            color="var(--warning)"
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-cols-2">
        
        {/* Left Card: High Risk Goals list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} /> Risk Action Center
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roadmaps with risk factors exceeding 35%</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                <th style={{ padding: '8px' }}>User</th>
                <th style={{ padding: '8px' }}>Roadmap Goal</th>
                <th style={{ padding: '8px' }}>Progress</th>
                <th style={{ padding: '8px' }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {highRiskGoals.map((g, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px' }}>
                    <span style={{ fontWeight: 500, display: 'block' }}>{g.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.email}</span>
                  </td>
                  <td style={{ padding: '8px', fontWeight: 500 }}>🧭 {g.title}</td>
                  <td style={{ padding: '8px' }}>{Math.round(Number(g.completion_percentage))}%</td>
                  <td style={{ padding: '8px', color: 'var(--danger)', fontWeight: 600 }}>{Math.round(Number(g.risk_score) * 100)}%</td>
                </tr>
              ))}

              {highRiskGoals.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '16px', textAlignment: 'center', color: 'var(--text-muted)' }}>
                    All user roadmaps are executing on time!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Card: Platform Registrations list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} /> User Directory
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monitor and manage user accounts</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                <th style={{ padding: '8px' }}>Registered User</th>
                <th style={{ padding: '8px' }}>Role</th>
                <th style={{ padding: '8px' }}>XP</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px' }}>
                    <span style={{ fontWeight: 500, display: 'block' }}>{u.fullName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                  </td>
                  <td style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.75rem' }}>{u.role}</td>
                  <td style={{ padding: '8px' }}>{u.xp} XP</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.email)} 
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Delete user account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
