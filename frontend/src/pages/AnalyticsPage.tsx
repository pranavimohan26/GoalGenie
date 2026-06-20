import React, { useState, useEffect } from 'react';
import { api, Goal } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { BarChart3, TrendingUp, ShieldAlert, Award, Calendar } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.goals.list();
        setGoals(res.goals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Compiling Analytical Datasets...</span>
      </div>
    );
  }

  // Calculate global stats
  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const avgCompletion = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + Number(g.completion_percentage), 0) / goals.length)
    : 0;

  // Pick primary active goal for single charts
  const activeGoal = goals.find(g => g.status === 'active') || goals[0] || null;

  // Math metrics for charts
  const weeklyProductivity = [
    { day: 'Mon', value: 2 },
    { day: 'Tue', value: 4 },
    { day: 'Wed', value: 3 },
    { day: 'Thu', value: 6 },
    { day: 'Fri', value: 5 },
    { day: 'Sat', value: 8 },
    { day: 'Sun', value: 7 }
  ];

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>
          Performance <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Evaluate your daily study velocity and goal success estimates.
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3>No goals available to evaluate</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
            Analytics graphs require at least one generated learning roadmap.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Metrics row */}
          <div className="grid-cols-3">
            <MetricCard
              title="Success Probability"
              value={activeGoal ? `${Math.round((1 - Number(activeGoal.risk_score)) * 100)}%` : '100%'}
              icon={<Award size={22} />}
              trend={activeGoal ? `Based on "${activeGoal.title}"` : 'No active goals'}
              trendType="positive"
            />
            <MetricCard
              title="Execution Velocity"
              value="5.0 / wk"
              icon={<TrendingUp size={22} />}
              trend="Tasks completed weekly"
              color="var(--secondary)"
            />
            <MetricCard
              title="Platform Streaks"
              value={`${completedCount} Goals`}
              icon={<BarChart3 size={22} />}
              trend="Total completed pathways"
              color="var(--success)"
            />
          </div>

          {/* SVG Graphs Row */}
          <div className="grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Chart 1: Productivity Trends (Line Chart SVG) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Productivity Trends</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks completed over the last 7 days</p>
              </div>

              {/* Custom SVG Line Chart */}
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

                  {/* Y Axis text labels */}
                  <text x="25" y="24" fill="var(--text-dark)" fontSize="10" textAnchor="middle">8</text>
                  <text x="25" y="74" fill="var(--text-dark)" fontSize="10" textAnchor="middle">5</text>
                  <text x="25" y="124" fill="var(--text-dark)" fontSize="10" textAnchor="middle">2</text>
                  <text x="25" y="174" fill="var(--text-dark)" fontSize="10" textAnchor="middle">0</text>

                  {/* Path Data calculation */}
                  {/* Points: M 60,140 L 120,110 L 180,125 L 240,80 L 300,95 L 360,50 L 420,65 */}
                  <path
                    d="M 60,140 L 120,110 L 180,125 L 240,80 L 300,95 L 360,50 L 420,65"
                    fill="none"
                    stroke="url(#accent-gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Nodes circles */}
                  <circle cx="60" cy="140" r="5" fill="var(--primary)" />
                  <circle cx="120" cy="110" r="5" fill="var(--primary)" />
                  <circle cx="180" cy="125" r="5" fill="var(--primary)" />
                  <circle cx="240" cy="80" r="5" fill="var(--secondary)" />
                  <circle cx="300" cy="95" r="5" fill="var(--secondary)" />
                  <circle cx="360" cy="50" r="5" fill="var(--secondary)" />
                  <circle cx="420" cy="65" r="5" fill="var(--secondary)" />

                  {/* X Axis text labels */}
                  <text x="60" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mon</text>
                  <text x="120" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Tue</text>
                  <text x="180" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Wed</text>
                  <text x="240" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Thu</text>
                  <text x="300" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Fri</text>
                  <text x="360" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sat</text>
                  <text x="420" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sun</text>

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Chart 2: Milestone completion rates (Bar Chart SVG) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Milestone Progress Details</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks completed ratio per milestone</p>
              </div>

              {/* Custom SVG Bar Chart */}
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                  <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="95" x2="480" y2="95" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

                  <text x="25" y="24" fill="var(--text-dark)" fontSize="10" textAnchor="middle">100%</text>
                  <text x="25" y="99" fill="var(--text-dark)" fontSize="10" textAnchor="middle">50%</text>
                  <text x="25" y="174" fill="var(--text-dark)" fontSize="10" textAnchor="middle">0%</text>

                  {/* Milestone 1 bar (100% complete) */}
                  <rect x="90" y="20" width="40" height="150" fill="var(--success)" rx="4" opacity="0.85" />
                  
                  {/* Milestone 2 bar (60% complete) */}
                  <rect x="230" y="80" width="40" height="90" fill="var(--primary)" rx="4" opacity="0.85" />
                  
                  {/* Milestone 3 bar (0% complete) */}
                  <rect x="370" y="170" width="40" height="0" fill="var(--border-color)" rx="4" />

                  {/* Labels */}
                  <text x="110" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Node 1</text>
                  <text x="250" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Node 2</text>
                  <text x="390" y="192" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Node 3</text>
                </svg>
              </div>
            </div>

          </div>

          {/* Table list of all goals progress statistics */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-header)' }}>Metrics Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '12px' }}>Learning Pathway</th>
                  <th style={{ padding: '12px' }}>Completion</th>
                  <th style={{ padding: '12px' }}>Risk Score</th>
                  <th style={{ padding: '12px' }}>Commitment</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {goals.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>🧭 {g.title}</td>
                    <td style={{ padding: '12px' }}>{Math.round(Number(g.completion_percentage))}%</td>
                    <td style={{ padding: '12px', color: Number(g.risk_score) > 0.35 ? 'var(--danger)' : 'var(--success)' }}>
                      {Number(g.risk_score) > 0.35 ? '⚠️ High' : '🟢 Low'} ({g.risk_score})
                    </td>
                    <td style={{ padding: '12px' }}>{g.daily_time_commitment} hrs/day</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: g.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                        color: g.status === 'completed' ? 'var(--success)' : 'var(--primary)'
                      }}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};
export default AnalyticsPage;
