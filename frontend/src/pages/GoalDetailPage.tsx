import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Goal, Milestone } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Brain, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Youtube, 
  Book, 
  FileText, 
  PlayCircle,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { LearningModal } from '../components/LearningModal';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [adapting, setAdapting] = useState(false);
  const [adaptSuccessMessage, setAdaptSuccessMessage] = useState<string | null>(null);
  const [badgeUnlocked, setBadgeUnlocked] = useState<{ name: string; desc: string } | null>(null);
  const [activeLearningMilestone, setActiveLearningMilestone] = useState<{ id: string; title: string } | null>(null);

  const fetchGoal = async () => {
    if (!id) return;
    try {
      const res = await api.goals.getDetails(id);
      setGoal(res.goal);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch learning roadmap details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.tasks.update(taskId, newStatus);
      
      // Refresh local goal data
      await fetchGoal();
      
      // Update global user XP and streaks
      await refreshUser();

      // Show alert if badge unlocked
      if (res.metrics.newBadge) {
        setBadgeUnlocked({
          name: res.metrics.newBadge.badgeName,
          desc: res.metrics.newBadge.description
        });
        setTimeout(() => setBadgeUnlocked(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleAdaptRoadmap = async () => {
    if (!id) return;
    setAdapting(true);
    setAdaptSuccessMessage(null);
    try {
      const res = await api.goals.adapt(id);
      setAdaptSuccessMessage(res.message);
      await fetchGoal();
      await refreshUser();
    } catch (err: any) {
      console.error(err);
      alert('Failed to recalculate roadmap: ' + (err.message || 'Server error'));
    } finally {
      setAdapting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this learning path? All progress will be archived.')) return;
    try {
      await api.goals.delete(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete goal.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Assembling Roadmap Nodes...</span>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="main-content" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Roadmap Not Found</h2>
        <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to Dashboard</Link>
      </div>
    );
  }

  const risk = Number(goal.risk_score);
  const isHighRisk = risk > 0.35;
  const isMedRisk = risk > 0.1 && risk <= 0.35;

  const getResourceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('youtube') || t.includes('video')) return <Youtube size={16} style={{ color: '#ef4444' }} />;
    if (t.includes('book')) return <Book size={16} style={{ color: '#f59e0b' }} />;
    if (t.includes('documentation') || t.includes('docs')) return <FileText size={16} style={{ color: '#3b82f6' }} />;
    return <PlayCircle size={16} style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Back and actions header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/mentor?goal=${goal.id}`} className="btn btn-primary">
            <Brain size={18} /> Ask AI Mentor
          </Link>
          
          <button 
            onClick={handleAdaptRoadmap} 
            className="btn btn-secondary" 
            disabled={adapting}
            title="Recalculates dates and strategies based on progress delays"
          >
            {adapting ? 'Recalculating...' : 'AI Adaptive Planner'}
          </button>
          
          <button onClick={handleDeleteGoal} className="btn btn-danger" style={{ padding: '10px' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Badge Unlocked Notification popup */}
      {badgeUnlocked && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--success)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1000,
          animation: 'pulse 1s'
        }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px', borderRadius: '50%' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>Achievement Unlocked</span>
            <h4 style={{ fontSize: '1rem', marginTop: '2px' }}>{badgeUnlocked.name}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{badgeUnlocked.desc}</p>
          </div>
        </div>
      )}

      {/* Alert message from Adaptive Planner */}
      {adaptSuccessMessage && (
        <div className="card" style={{ borderLeft: '4px solid var(--success)', padding: '16px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: 600 }}>Adaptive Planner Triggered</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{adaptSuccessMessage}</span>
        </div>
      )}

      {/* Goal Hero Details Card */}
      <div className="card goal-details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>🧭 {goal.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{goal.description}</p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Calendar size={16} /> {goal.duration_months} Months Total
            </span>
            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Clock size={16} /> {goal.daily_time_commitment} Hours/day committed
            </span>
          </div>
        </div>

        {/* Status Metrics Box */}
        <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'stretch', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '32px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roadmap Progress</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontFamily: 'var(--font-header)', fontWeight: 700 }}>
                {Math.round(Number(goal.completion_percentage))}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ width: `${goal.completion_percentage}%`, height: '100%', background: 'var(--gradient-accent)' }} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Goal Achievement Risk</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              {isHighRisk && <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />}
              {isMedRisk && <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />}
              {!isHighRisk && !isMedRisk && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
              <span style={{ 
                fontWeight: 600, 
                color: isHighRisk ? 'var(--danger)' : isMedRisk ? 'var(--warning)' : 'var(--success)' 
              }}>
                {isHighRisk ? `High Risk (${Math.round(risk * 100)}%)` : isMedRisk ? `Medium Risk (${Math.round(risk * 100)}%)` : 'On Track (Low Risk)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Hierarchy rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛤️ The Learning Journey
          {Math.round(Number(goal.completion_percentage)) >= 100 && (
            <span className="float-animation" style={{ marginLeft: '10px', color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
              <Award size={28} className="trophy-glow" /> <span style={{ fontSize: '1.2rem', marginLeft: '8px', textShadow: '0 0 10px rgba(255, 215, 0, 0.4)' }}>Mastery Achieved!</span>
            </span>
          )}
        </h2>

        <div className="journey-container">
          {goal.milestones && goal.milestones.map((mil: Milestone) => {
            
            const isMilCompleted = mil.status === 'completed';
            const isMilActive = mil.status === 'in_progress';

            return (
              <div key={mil.id} className={`journey-node ${isMilCompleted ? 'completed' : isMilActive ? 'active' : ''}`}>
                <div className={`dynamic-hurdle-card ${isMilCompleted ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Milestone Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: isMilCompleted ? 'var(--success)' : isMilActive ? 'var(--primary)' : 'var(--bg-card-hover)',
                      color: isMilCompleted || isMilActive ? 'white' : 'var(--text-main)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Node {mil.order_index}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: isMilCompleted ? 'var(--success)' : 'var(--text-main)' }}>
                      {mil.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.4 }}>
                    {mil.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Target Date: {new Date(mil.target_date).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setActiveLearningMilestone({ id: mil.id, title: mil.title })}
                    className="btn btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <BookOpen size={14} /> Start Learning
                  </button>
                </div>
              </div>

              {/* Tasks Checklist Grid */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Syllabus Checklist
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mil.tasks.map((task) => (
                    <label key={task.id} className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        className="checkbox-input"
                        onChange={() => handleTaskToggle(task.id, task.is_completed)}
                      />
                      <span className="checkmark" />
                      <div style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? 'var(--text-dark)' : 'var(--text-main)' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block' }}>{task.title}</span>
                        {task.description && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</span>
                        )}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                          ⏱️ Est: {task.estimated_minutes} mins
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Milestone Recommendations Section */}
              {mil.resources && mil.resources.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Curated Learning Resources
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {mil.resources.map((res) => (
                      <a 
                        key={res.id} 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--bg-card-hover)',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getResourceIcon(res.type)}
                          <div>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {res.title} 
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', border: '1px solid var(--border-color)', padding: '1px 4px', borderRadius: '3px' }}>
                                {res.type}
                              </span>
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                              💡 Rationale: {res.rationale}
                            </span>
                          </div>
                        </div>
                        <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Modal Integration */}
      {activeLearningMilestone && (
        <LearningModal
          milestoneId={activeLearningMilestone.id}
          milestoneTitle={activeLearningMilestone.title}
          onClose={() => setActiveLearningMilestone(null)}
        />
      )}
    </div>
  );
};
export default GoalDetailPage;
