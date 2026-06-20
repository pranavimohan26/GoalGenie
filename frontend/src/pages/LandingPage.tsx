import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, Brain, Flame, Target, ChevronRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Sparkles size={24} />,
      title: 'AI Goal Decomposition',
      description: 'Break down massive life dreams into milestone roadmaps, monthly targets, and daily checklist items.'
    },
    {
      icon: <Brain size={24} />,
      title: 'Interactive AI Mentor',
      description: 'An AI assistant that understands your current milestone, reviews your progress, and explains complex concepts.'
    },
    {
      icon: <Target size={24} />,
      title: 'Goal Risk Estimations',
      description: 'Get warnings based on your daily commitment levels and study velocity. Keep delays at bay.'
    },
    {
      icon: <Flame size={24} />,
      title: 'Dynamic Adaptive Planning',
      description: 'Slipped behind schedule? Re-route future deadlines and milestones with dynamic recovery suggestions.'
    }
  ];

  const mockGoals = [
    'Become a Data Scientist in 12 months',
    'Become a Cybersecurity Engineer in 2 years',
    'Crack GATE Competitive Exam',
    'Learn Full Stack Development',
    'Lose 15 kg in 8 months'
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 48px',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={36} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' }} />
          <span style={{
            fontFamily: 'var(--font-header)',
            fontWeight: 900,
            fontSize: '1.8rem',
            letterSpacing: '-0.03em',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            GoalGenie
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Start Free</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '80px 24px 60px 24px',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          color: 'var(--primary)',
          padding: '8px 16px',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={14} /> AI-Powered Career Planning
        </div>
        <h1 style={{
          fontSize: '3.8rem',
          lineHeight: 1.1,
          fontWeight: 800,
          fontFamily: 'var(--font-header)',
          letterSpacing: '-0.03em'
        }}>
          Who do you want to become? Let <span className="gradient-text">AI Guide You</span> there.
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '640px'
        }}>
          Transform long-term goals into structured roadmaps. Learn concepts with an interactive AI mentor, track risk levels, and dynamically reschedule plans when life gets in the way.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
            Build Your Roadmap <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Interactive Goals List */}
      <section style={{ maxWidth: '1000px', margin: '40px auto 80px auto', width: '100%', padding: '0 24px' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-dark)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', fontWeight: 600 }}>
          Popular Roadmap Generations
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
          {mockGoals.map((g, idx) => (
            <div key={idx} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '14px 24px',
              borderRadius: '30px',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              🧭 {g}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        backgroundColor: 'var(--bg-nav)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '48px', fontFamily: 'var(--font-header)' }}>
            Everything you need to complete <span className="gradient-text">ambitious projects</span>
          </h2>
          
          <div className="grid-cols-2">
            {features.map((f, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  color: 'white',
                  background: 'var(--gradient-accent)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--gradient-glow)'
                }}>
                  {f.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-dark)',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.9rem'
      }}>
        &copy; {new Date().getFullYear()} GoalGenie (AI Life Navigator). All rights reserved.
      </footer>
    </div>
  );
};
export default LandingPage;
