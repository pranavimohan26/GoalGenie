import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Compass, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

export const GoalCreationPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [knowledgeLevel, setKnowledgeLevel] = useState('none');
  const [dailyTimeCommitment, setDailyTimeCommitment] = useState('2');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal description');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.goals.create({
        title,
        durationMonths: parseInt(durationMonths),
        knowledgeLevel,
        dailyTimeCommitment: parseInt(dailyTimeCommitment)
      });
      // Redirect directly to the generated roadmap details!
      navigate(`/goals/${res.goalId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI Roadmap decomposition failed. Verify backend configurations.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '90vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        gap: '24px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-accent)',
          borderRadius: '50%',
          boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}>
          <Compass size={40} style={{ color: 'white', animation: 'spin 6s linear infinite' }} />
        </div>
        
        <div>
          <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.6rem', marginBottom: '8px' }}>
            AI Decomposing Your Goal...
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px' }}>
            Designing custom milestones, weekly syllabus checklists, and selecting resources matching your study style. This will take a few seconds...
          </p>
        </div>

        {/* Dynamic mini-progress indicators */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-dark)'
        }}>
          <div className="pulse-loader">🤖 Formulating prompt specifications...</div>
          <div className="pulse-loader" style={{ animationDelay: '0.4s' }}>📂 Splitting milestones...</div>
          <div className="pulse-loader" style={{ animationDelay: '0.8s' }}>🔗 Integrating external study links...</div>
        </div>

        {/* CSS Spin style injection */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '640px' }}>
      
      {/* Back to Dashboard */}
      <Link to="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        marginBottom: '24px'
      }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Sparkles size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.6rem', fontWeight: 700 }}>
            Configure Learning Roadmap
          </h2>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="goal-title">What is your long-term goal?</label>
            <input
              id="goal-title"
              type="text"
              required
              placeholder="e.g. Become a Cybersecurity Engineer, Learn Full Stack Dev, Lose 15 kg"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: '4px', display: 'block' }}>
              Describe what you want to achieve or become.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="duration">Target Duration</label>
              <select
                id="duration"
                className="form-input"
                style={{ height: '45px' }}
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months (2 Years)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="knowledge">Current Knowledge Level</label>
              <select
                id="knowledge"
                className="form-input"
                style={{ height: '45px' }}
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
              >
                <option value="none">None (Total Beginner)</option>
                <option value="beginner">Beginner (Know basic syntax/concepts)</option>
                <option value="intermediate">Intermediate (Some projects done)</option>
                <option value="advanced">Advanced (Have professional exposure)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="time">Daily Study Commitment</label>
            <select
              id="time"
              className="form-input"
              style={{ height: '45px' }}
              value={dailyTimeCommitment}
              onChange={(e) => setDailyTimeCommitment(e.target.value)}
            >
              <option value="1">1 Hour per day</option>
              <option value="2">2 Hours per day</option>
              <option value="3">3 Hours per day</option>
              <option value="4">4 Hours per day</option>
              <option value="6">6 Hours per day</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', marginTop: '10px' }}>
            Generate Custom AI Roadmap
          </button>
        </form>
      </div>
    </div>
  );
};
export default GoalCreationPage;
