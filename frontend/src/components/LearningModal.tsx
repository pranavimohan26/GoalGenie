import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, BookOpen, CheckSquare, HelpCircle, Target } from 'lucide-react';

interface LearningModalProps {
  milestoneId: string;
  milestoneTitle: string;
  onClose: () => void;
}

export const LearningModal: React.FC<LearningModalProps> = ({ milestoneId, milestoneTitle, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'practice' | 'quiz'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.learning.getSession(milestoneId);
        if (res.success) {
          const parsedSession = {
            ...res.session,
            practiceTasks: JSON.parse(res.session.practiceTasks),
            quiz: JSON.parse(res.session.quiz)
          };
          setSession(parsedSession);
          if (res.session.isCompleted) {
            setQuizSubmitted(true);
            setScore(res.session.quizScore);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [milestoneId]);

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const submitQuiz = async () => {
    if (!session || Object.keys(quizAnswers).length < session.quiz.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let calculatedScore = 0;
    session.quiz.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) {
        calculatedScore++;
      }
    });

    try {
      await api.learning.submitQuiz(milestoneId, calculatedScore);
      setScore(calculatedScore);
      setQuizSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg-main)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={24} style={{ color: 'var(--primary)' }} />
              Learn: {milestoneTitle}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div className="pulse-loader" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Generating AI Course Material...</div>
          </div>
        ) : !session ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Failed to load learning session.</div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <button
                onClick={() => setActiveTab('content')}
                style={{
                  flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === 'content' ? '2px solid var(--primary)' : 'none',
                  color: activeTab === 'content' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'content' ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <BookOpen size={16} /> Concepts & Notes
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                style={{
                  flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === 'practice' ? '2px solid var(--primary)' : 'none',
                  color: activeTab === 'practice' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'practice' ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Target size={16} /> Practice Tasks
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === 'quiz' ? '2px solid var(--primary)' : 'none',
                  color: activeTab === 'quiz' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'quiz' ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <HelpCircle size={16} /> Knowledge Quiz
              </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-main)' }}>
              {activeTab === 'content' && (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  {session.content}
                </div>
              )}

              {activeTab === 'practice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ marginBottom: '10px' }}>Recommended Practice Tasks</h3>
                  {session.practiceTasks.map((pt: any, idx: number) => (
                    <div key={idx} style={{
                      backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px',
                      border: '1px solid var(--border-color)', display: 'flex', gap: '12px'
                    }}>
                      <CheckSquare size={20} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{pt.title}</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{pt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {quizSubmitted && (
                    <div style={{
                      backgroundColor: score && score >= 3 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: score && score >= 3 ? 'var(--success)' : 'var(--danger)',
                      padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 600
                    }}>
                      Quiz Completed! You scored {score} out of {session.quiz.length}
                    </div>
                  )}

                  {session.quiz.map((q: any, qIdx: number) => (
                    <div key={qIdx} style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>{qIdx + 1}. {q.question}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctAnswerIndex === optIdx;
                          let btnStyle = {
                            padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'left' as const, cursor: 'pointer', transition: 'all 0.2s'
                          };

                          if (quizSubmitted) {
                            btnStyle.cursor = 'default';
                            if (isCorrect) {
                              btnStyle.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                              btnStyle.border = '1px solid var(--success)';
                            } else if (isSelected && !isCorrect) {
                              btnStyle.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                              btnStyle.border = '1px solid var(--danger)';
                            }
                          } else if (isSelected) {
                            btnStyle.border = '1px solid var(--primary)';
                            btnStyle.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(qIdx, optIdx)}
                              style={btnStyle}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted && (
                    <button onClick={submitQuiz} className="btn btn-primary" style={{ padding: '16px', fontSize: '1.1rem' }}>
                      Submit Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
