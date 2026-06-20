import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'neutral',
  color = 'var(--primary)'
}) => {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'var(--success)';
    if (trendType === 'negative') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        <div style={{
          color: color,
          backgroundColor: `${color}15`,
          padding: '8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontSize: '2.4rem', fontFamily: 'var(--font-header)', fontWeight: 800, color: 'var(--text-main)' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.8rem', color: getTrendColor(), fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
export default MetricCard;
