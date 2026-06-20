import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Check your credentials.');
    } finally {
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
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Compass size={40} className="gradient-text" style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resume your learning navigator path</p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

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
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Terms and Conditions */}
            <div style={{ marginTop: '10px' }}>
              <div className="terms-header">Terms and Conditions</div>
              <div className="terms-box" style={{ height: '110px' }}>
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
            <label className="checkbox-container" style={{ margin: '4px 0 12px 0', display: 'flex', alignItems: 'center' }}>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading || !acceptedTerms}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>New to GoalGenie? </span>
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Create an Account
            </Link>
          </div>
        </div>

        {/* Development Fallback Note */}
        <div className="card" style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-dark)', borderStyle: 'dashed', textAlign: 'center' }}>
          💡 <strong>Dev Quick Tip:</strong> Register a new account first, or configure a test connection using your Postgres server credentials.
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
