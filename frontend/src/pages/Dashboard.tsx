import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Goal, User } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Bell, 
  BookOpen, 
  ArrowRight,
  Flame
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const goalsData = await api.goals.list();
        setGoals(goalsData.goals);
        
        const profileData = await api.auth.getProfile();
        setProfile(profileData.profile);
      } catch (err: any) {
        console.error(err);
        setError('Failed to sync dashboard metrics. Is the database running?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Synchronizing Life Metrics...</span>
      </div>
    );
  }

  // Calculate generic dashboard metrics
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const avgCompletion = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + Number(g.completion_percentage), 0) / goals.length) 
    : 0;

  const highRiskCount = goals.filter(g => Number(g.risk_score) > 0.35).length;

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>
            Hello, <span className="gradient-text">{profile?.fullName}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Check your roadmap velocity and active study modules.
          </p>
        </div>
        <Link to="/goals/new" className="btn btn-primary">
          <Plus size={18} /> Generate New Goal
        </Link>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--danger)' }}>
          <AlertTriangle />
          <span>{error} (Make sure your backend server and PostgreSQL database are running)</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-3">
        <MetricCard
          title="Active Goals"
          value={activeGoalsCount}
          icon={<Target size={22} />}
          trend={`${completedGoalsCount} Completed`}
          trendType="positive"
        />
        <MetricCard
          title="Average Progress"
          value={`${avgCompletion}%`}
          icon={<TrendingUp size={22} />}
          trend="Overall roadmap ratio"
          color="var(--secondary)"
        />
        <MetricCard
          title="High Risk Goals"
          value={highRiskCount}
          icon={<AlertTriangle size={22} />}
          trend={highRiskCount > 0 ? 'Action required!' : 'Plan execution on track'}
          trendType={highRiskCount > 0 ? 'negative' : 'positive'}
          color={highRiskCount > 0 ? 'var(--danger)' : 'var(--success)'}
        />
      </div>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        
        {/* Left Column: Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={20} style={{ color: 'var(--primary)' }} /> Your AI Learning Paths
          </h2>

          {goals.length === 0 ? (
            /* Empty state card */
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <BookOpen size={30} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No active goals configured</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px' }}>
                  Provide our AI engine with a career milestone (e.g. Become a Full Stack Engineer) and receive a structured daily study plan.
                </p>
              </div>
              <Link to="/goals/new" className="btn btn-primary">
                Create Your First Goal
              </Link>
            </div>
          ) : (
            /* Map Goals list cards */
            goals.map((g) => {
              const risk = Number(g.risk_score);
              const isHighRisk = risk > 0.35;
              const isMedRisk = risk > 0.1 && risk <= 0.35;
              
              const getRiskLabel = () => {
                if (isHighRisk) return { label: 'High Risk', bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' };
                if (isMedRisk) return { label: 'Medium Risk', bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' };
                return { label: 'On Track', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' };
              };

              const riskBadge = getRiskLabel();

              return (
                <Link key={g.id} to={`/goals/${g.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={`dynamic-hurdle-card ${Number(g.completion_percentage) >= 100 ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          🧭 {g.title}
                        </h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Timeframe: {g.duration_months} Months &bull; commitment: {g.daily_time_commitment} hrs/day
                        </span>
                      </div>
                      
                      {/* Risk Badge */}
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: riskBadge.bg,
                        color: riskBadge.color
                      }}>
                        {riskBadge.label}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <span>Completion Ratio</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{Math.round(Number(g.completion_percentage))}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${g.completion_percentage}%`,
                          height: '100%',
                          background: 'var(--gradient-accent)',
                          borderRadius: '10px',
                          transition: 'var(--transition-smooth)'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, alignItems: 'center', gap: '4px' }}>
                      View Study Roadmap <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Right Column: Streaks, Achievements & System Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Achievements panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Award size={20} style={{ color: 'var(--primary)' }} /> Level & Achievements
            </h3>
            
            {/* XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>XP Level {(profile?.xp ? Math.floor(profile.xp / 100) : 0) + 1}</span>
                <span style={{ fontWeight: 600 }}>{(profile?.xp || 0) % 100} / 100 XP</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(profile?.xp || 0) % 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '10px'
                }} />
              </div>
            </div>

            {/* Badges list */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {profile?.achievements && profile.achievements.length > 0 ? (
                profile.achievements.map((badge, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem'
                  }} title={badge.description}>
                    🏆 {badge.badge_name}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Unlock badges by completing study tasks!</span>
              )}
            </div>
          </div>

          {/* Notifications / Alerts panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Bell size={20} style={{ color: 'var(--secondary)' }} /> Mentor Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px', fontSize: '0.95rem', lineHeight: 1.45 }}>
                <span style={{ fontWeight: 700, display: 'block', color: 'var(--text-main)', marginBottom: '2px' }}>Streak Streak Streak!</span>
                <span style={{ color: 'var(--text-muted)' }}>You logged in today to continue your streak! Complete a task today to earn +15 XP.</span>
              </div>

              {goals.some(g => Number(g.risk_score) > 0.35) && (
                <div style={{ borderLeft: '3px solid var(--danger)', paddingLeft: '12px', fontSize: '0.95rem', lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 700, display: 'block', color: 'var(--danger)', marginBottom: '2px' }}>High Delay Warning</span>
                  <span style={{ color: 'var(--text-muted)' }}>One of your roadmaps is at risk of missing its deadline. Access Goal Details and click "AI Adaptive Planner" to auto-reschedule.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Dashboard;
