import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, Goal } from '../services/api';
import { Brain, ArrowLeft, Send, Sparkles, Compass } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'mentor';
  text: string;
  timestamp: Date;
}

export const MentorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goalIdFromUrl = searchParams.get('goal');

  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await api.goals.list();
        setGoals(res.goals);
        
        // Pick goal context
        if (goalIdFromUrl && res.goals.some(g => g.id === goalIdFromUrl)) {
          setSelectedGoalId(goalIdFromUrl);
        } else if (res.goals.length > 0) {
          setSelectedGoalId(res.goals[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadGoals();
  }, [goalIdFromUrl]);

  useEffect(() => {
    if (selectedGoalId) {
      const selected = goals.find(g => g.id === selectedGoalId) || null;
      setActiveGoal(selected);
      
      // Seed initial welcome message from AI Mentor
      if (selected) {
        setMessages([
          {
            sender: 'mentor',
            text: `Hello! I am your AI Mentor for your path to "${selected.title}". Ask me anything about current study materials, concept explanations, or ask "Am I on track?" to review your risks.`,
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [selectedGoalId, goals]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedGoalId) return;

    const userText = inputText.trim();
    setInputText('');
    
    // Append user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userText,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      const res = await api.mentor.chat(selectedGoalId, userText);
      setMessages(prev => [...prev, {
        sender: 'mentor',
        text: res.reply,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'mentor',
        text: 'Sorry, I encountered an error formulating my reply. Make sure the server and APIs are accessible.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Contacting AI Mentor...</span>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and Context selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Link to={activeGoal ? `/goals/${activeGoal.id}` : '/dashboard'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Roadmap
        </Link>

        {goals.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Goal Context:</span>
            <select
              className="form-input"
              style={{ width: '240px', height: '40px', padding: '0 12px' }}
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
            >
              {goals.map(g => (
                <option key={g.id} value={g.id}>🧭 {g.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center' }}>
          <Brain size={48} style={{ color: 'var(--primary)' }} />
          <h3>No active goal configurations found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '360px', fontSize: '0.9rem' }}>
            You need to create at least one roadmap before you can chat with the AI Mentor.
          </p>
          <Link to="/goals/new" className="btn btn-primary">Generate Goal Roadmap</Link>
        </div>
      ) : (
        /* Chat Area Card */
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Active Goal Metadata header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-nav)' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', uppercase: 'true' }}>Active Mentor Session</span>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{activeGoal?.title}</h3>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}>
                  <div style={{
                    maxWidth: '75%',
                    backgroundColor: isUser ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: 'white',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: isUser ? '4px' : 'var(--radius-lg)',
                    borderBottomLeftRadius: isUser ? 'var(--radius-lg)' : '4px',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    {msg.text}
                    <span style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                      textAlign: 'right',
                      marginTop: '6px'
                    }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Thinking / Typing loading bubble */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomLeftRadius: '4px',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }} className="pulse-loader">
                  <Brain size={16} /> Mentor is searching databases...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form message input container */}
          <form onSubmit={handleSendMessage} style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            backgroundColor: 'var(--bg-nav)'
          }}>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ask a concept explanation or study tip..."
              className="form-input"
              style={{ flex: 1 }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }} disabled={loading}>
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
export default MentorPage;
