import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User as UserIcon, BookOpen, AlertCircle, Clock, Award } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Registration Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Profile Form States
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [learningStyle, setLearningStyle] = useState('practical');
  const [interests, setInterests] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Account details, Step 2: Learning profile

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill in all account credentials');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      email,
      password,
      fullName,
      age: age ? parseInt(age) : undefined,
      education,
      skillLevel,
      hoursPerDay: parseInt(hoursPerDay),
      learningStyle,
      interests
    };

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-main)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Compass size={40} className="gradient-text" style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.8rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {step === 1 ? 'Step 1: Credentials configuration' : 'Step 2: Profile settings'}
          </p>
        </div>

        {/* Register Card */}
        <div className="card" style={{ padding: '32px' }}>
          
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

          {step === 1 ? (
            /* STEP 1: ACCOUNT DETAILS */
            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Alice Cooper"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="alice@example.com"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Next: Customize Profile
              </button>
            </form>
          ) : (
            /* STEP 2: PROFILE SETUP DETAILS */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    placeholder="25"
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hours">Available Hours/Day</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dark)' }} />
                    <select
                      id="hours"
                      className="form-input"
                      style={{ paddingLeft: '38px', height: '45px' }}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(e.target.value)}
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="8">8+ Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="education">Education / Background</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    id="education"
                    type="text"
                    placeholder="e.g. Computer Science Student, Self-taught"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="style">Learning Style</label>
                  <select
                    id="style"
                    className="form-input"
                    style={{ height: '45px' }}
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                  >
                    <option value="practical">Practical (Labs/Projects)</option>
                    <option value="visual">Visual (Video/Animations)</option>
                    <option value="reading">Text-focused (Docs/Books)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="skill">Knowledge Level</label>
                  <select
                    id="skill"
                    className="form-input"
                    style={{ height: '45px' }}
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="interests">Interests / Focus Areas</label>
                <input
                  id="interests"
                  type="text"
                  placeholder="e.g. AI, Python, Hacking, UI Design"
                  className="form-input"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              {/* Scrollable Terms and Conditions */}
              <div style={{ marginTop: '10px' }}>
                <div className="terms-header">Terms and Conditions</div>
                <div className="terms-box">
                  <p style={{ fontWeight: 600, marginBottom: '6px' }}>Welcome to AI Life Navigator. By creating an account or using this application, you agree to the following terms and conditions:</p>
                  <p>1. Users must provide accurate and truthful information during registration.</p>
                  <p>2. The AI-generated roadmaps, recommendations, and guidance are provided for educational and planning purposes only and should not be considered professional, legal, medical, financial, or career advice.</p>
                  <p>3. Users are responsible for verifying any recommendations before acting upon them.</p>
                  <p>4. Users must not misuse the platform by uploading harmful, offensive, fraudulent, or illegal content.</p>
                  <p>5. Account credentials are personal and must not be shared with others.</p>
                  <p>6. The platform may collect and store user information, goals, progress data, and activity history to provide personalized recommendations and improve user experience.</p>
                  <p>7. Users retain ownership of their personal data. The platform will not sell personal information to third parties without consent.</p>
                  <p>8. AI-generated suggestions may not always be accurate, complete, or suitable for every user. Users should exercise their own judgment.</p>
                  <p>9. The platform reserves the right to suspend or terminate accounts that violate these terms or engage in unauthorized activities.</p>
                  <p>10. The platform may update features, functionality, or terms at any time. Continued use of the application constitutes acceptance of any updates.</p>
                  <p>11. The platform is not liable for any losses, damages, missed opportunities, or outcomes resulting from reliance on AI-generated recommendations.</p>
                  <p>12. By registering, you acknowledge that you have read, understood, and agreed to these Terms and Conditions and the Privacy Policy.</p>
                </div>
              </div>

              {/* Required Terms Checkbox */}
              <label className="checkbox-container" style={{ margin: '8px 0 16px 0', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="checkmark" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  I accept all the terms and conditions
                </span>
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading || !acceptedTerms}>
                  {loading ? 'Creating Navigator...' : 'Complete Profile'}
                </button>
              </div>

            </form>
          )}

          {step === 1 && (
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
