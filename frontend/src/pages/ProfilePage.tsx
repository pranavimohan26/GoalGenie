import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Award, Clock, BookOpen, Mail, Flame } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.auth.getProfile();
        setProfile(res.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <span className="pulse-loader" style={{ fontFamily: 'var(--font-header)' }}>Loading Navigator Profile...</span>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>
          Your <span className="gradient-text">Profile</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
          Review your learning preferences and earned achievements.
        </p>
      </div>

      <div className="profile-grid">
        
        {/* Left Column: Basic Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '30px' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)'
          }}>
            <UserIcon size={52} />
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.fullName}</h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', marginTop: '8px', display: 'inline-block' }}>
              🧭 {profile?.role}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start', fontSize: '0.95rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 500 }}>
              <Mail size={18} style={{ color: 'var(--text-muted)' }} /> {profile?.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 500 }}>
              <Flame size={18} style={{ color: '#f97316' }} /> Active Streak: <strong style={{ color: '#f97316' }}>{profile?.current_streak} days</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 500 }}>
              <Award size={18} style={{ color: 'var(--primary)' }} /> Total XP: <strong style={{ color: 'var(--primary)' }}>{profile?.xp} XP</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Preferences & Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Preferences Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontWeight: 700 }}>
              Learning Preferences
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-cols-2">
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Daily Hours</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '6px', display: 'block', color: 'var(--text-main)' }}>⏱️ {profile?.hoursPerDay} hours / day</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Learning Style</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '6px', display: 'block', textTransform: 'capitalize', color: 'var(--text-main)' }}>📚 {profile?.learningStyle}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Current Skill Level</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '6px', display: 'block', textTransform: 'capitalize', color: 'var(--text-main)' }}>🎓 {profile?.skillLevel}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Education Context</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '6px', display: 'block', color: 'var(--text-main)' }}>💼 {profile?.education || 'Not specified'}</span>
              </div>
            </div>

            {profile?.interests && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Interests</span>
                <p style={{ fontSize: '1.05rem', marginTop: '6px', color: 'var(--text-main)', fontWeight: 500 }}>🔥 {profile.interests}</p>
              </div>
            )}
          </div>

          {/* Badges Achievements Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontWeight: 700 }}>
              Unlocked Badges ({profile?.achievements?.length || 0})
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-2">
              {profile?.achievements && profile.achievements.map((badge) => (
                <div key={badge.id} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    color: 'var(--primary)',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{badge.badge_name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{badge.description}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '8px', display: 'block', fontWeight: 500 }}>
                      Unlocked {new Date(badge.unlocked_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {(!profile?.achievements || profile.achievements.length === 0) && (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Complete your first roadmap milestone checklist task to unlock badges!</span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default ProfilePage;
