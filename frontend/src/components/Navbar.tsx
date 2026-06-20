import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Flame, 
  Trophy, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Brain, 
  BarChart3,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle('light-theme');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--bg-nav)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand logo */}
      <Link to="/dashboard" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'inherit'
      }}>
        <Compass size={32} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' }} />
        <span style={{
          fontFamily: 'var(--font-header)',
          fontWeight: 900,
          fontSize: '1.65rem',
          letterSpacing: '-0.03em',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          GoalGenie
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link 
          to="/dashboard" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'var(--transition-smooth)',
            backgroundColor: isActive('/dashboard') ? 'var(--border-color)' : 'transparent'
          }}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link 
          to="/analytics" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: isActive('/analytics') ? 'var(--primary)' : 'var(--text-muted)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'var(--transition-smooth)',
            backgroundColor: isActive('/analytics') ? 'var(--border-color)' : 'transparent'
          }}
        >
          <BarChart3 size={18} />
          Analytics
        </Link>

        <Link 
          to="/profile" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: isActive('/profile') ? 'var(--primary)' : 'var(--text-muted)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'var(--transition-smooth)',
            backgroundColor: isActive('/profile') ? 'var(--border-color)' : 'transparent'
          }}
        >
          <UserIcon size={18} />
          Profile
        </Link>

        {user?.role === 'admin' && (
          <Link 
            to="/admin" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/admin') ? 'var(--primary)' : 'var(--text-muted)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'var(--transition-smooth)',
              backgroundColor: isActive('/admin') ? 'var(--border-color)' : 'transparent'
            }}
          >
            <Shield size={18} />
            Admin Panel
          </Link>
        )}
      </div>

      {/* User info, Theme & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Streak indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          color: 'rgb(249, 115, 22)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Flame size={16} fill="rgb(249, 115, 22)" />
          {user?.streak || 0} Days
        </div>

        {/* XP tracker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          color: 'var(--primary)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Trophy size={16} />
          {user?.xp || 0} XP
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          title="Toggle light/dark theme"
        >
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Profile indicator */}
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {user?.fullName}
        </span>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary"
          style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
