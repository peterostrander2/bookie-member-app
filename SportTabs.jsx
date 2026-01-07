import React from 'react';

const SportTabs = ({ selected, onChange, showAll = false }) => {
  const sports = [
    { key: 'NBA', icon: '🏀', name: 'NBA', color: '#FF6B35' },
    { key: 'NFL', icon: '🏈', name: 'NFL', color: '#013369' },
    { key: 'MLB', icon: '⚾', name: 'MLB', color: '#C41E3A' },
    { key: 'NHL', icon: '🏒', name: 'NHL', color: '#000000' },
    { key: 'NCAAB', icon: '🎓', name: 'NCAAB', color: '#FF8C00' }
  ];

  if (showAll) {
    sports.unshift({ key: 'ALL', icon: '📊', name: 'All Sports', color: '#00D4FF' });
  }

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {sports.map(sport => {
        const isSelected = selected === sport.key;
        return (
          <button
            key={sport.key}
            onClick={() => onChange(sport.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: isSelected ? '#00D4FF' : '#1a1a2e',
              color: isSelected ? '#000' : '#9ca3af',
              border: isSelected ? 'none' : '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: isSelected ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>{sport.icon}</span>
            <span>{sport.name}</span>
          </button>
        );
      })}
    </div>
  );
};

// Compact version for tight spaces
export const SportTabsCompact = ({ selected, onChange }) => {
  const sports = [
    { key: 'NBA', icon: '🏀' },
    { key: 'NFL', icon: '🏈' },
    { key: 'MLB', icon: '⚾' },
    { key: 'NHL', icon: '🏒' },
    { key: 'NCAAB', icon: '🎓' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      backgroundColor: '#12121f',
      padding: '4px',
      borderRadius: '10px'
    }}>
      {sports.map(sport => {
        const isSelected = selected === sport.key;
        return (
          <button
            key={sport.key}
            onClick={() => onChange(sport.key)}
            title={sport.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '36px',
              backgroundColor: isSelected ? '#00D4FF' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.2s ease'
            }}
          >
            {sport.icon}
          </button>
        );
      })}
    </div>
  );
};

// Dropdown version for mobile
export const SportDropdown = ({ selected, onChange }) => {
  const sports = [
    { key: 'NBA', icon: '🏀', name: 'NBA' },
    { key: 'NFL', icon: '🏈', name: 'NFL' },
    { key: 'MLB', icon: '⚾', name: 'MLB' },
    { key: 'NHL', icon: '🏒', name: 'NHL' },
    { key: 'NCAAB', icon: '🎓', name: 'NCAAB' }
  ];

  const selectedSport = sports.find(s => s.key === selected) || sports[0];

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '10px 15px',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 14 14\'><path fill=\'%236b7280\' d=\'M7 10L3 6h8z\'/></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '35px'
      }}
    >
      {sports.map(sport => (
        <option key={sport.key} value={sport.key}>
          {sport.icon} {sport.name}
        </option>
      ))}
    </select>
  );
};

export default SportTabs;
