import React, { useState, useEffect } from 'react';
import PropsSmashList from './PropsSmashList';
import GameSmashList from './GameSmashList';
import { usePreferences } from './usePreferences';

const SmashSpotsPage = () => {
  const { preferences, updatePreference } = usePreferences();
  const [sport, setSport] = useState(preferences.favoriteSport || 'NBA');
  const [activeTab, setActiveTab] = useState(preferences.defaultTab || 'props');

  // Persist sport selection
  const handleSportChange = (newSport) => {
    setSport(newSport);
    updatePreference('favoriteSport', newSport);
  };

  // Persist tab selection
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    updatePreference('defaultTab', newTab);
  };

  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB'];

  const tabs = [
    { id: 'props', label: 'Player Props', icon: '🔥', color: '#8B5CF6' },
    { id: 'games', label: 'Game Picks', icon: '🏀', color: '#00D4FF' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            color: '#fff', margin: 0, fontSize: '28px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            Smash Spots
          </h1>
          <p style={{ color: '#6B7280', margin: '8px 0 0', fontSize: '14px' }}>
            AI-Powered Best Bets • 8 Models + 8 Pillars
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => handleSportChange(s)}
              style={{
                padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s ease',
                backgroundColor: sport === s ? '#00D4FF' : '#1a1a2e',
                color: sport === s ? '#0a0a0f' : '#9CA3AF'
              }}
            >{s}</button>
          ))}
        </div>

        <div style={{ display: 'flex', backgroundColor: '#12121f', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? (tab.id === 'props' ? '#fff' : '#0a0a0f') : '#6B7280'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {activeTab === 'props' ? <PropsSmashList sport={sport} /> : <GameSmashList sport={sport} />}
        </div>

        <div style={{
          marginTop: '24px', padding: '16px', backgroundColor: '#12121f',
          borderRadius: '12px', border: '1px solid #2a2a4a'
        }}>
          <div style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center', marginBottom: '12px' }}>
            CONFIDENCE TIERS
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'SMASH', color: '#10B981', range: '85%+' },
              { label: 'STRONG', color: '#F59E0B', range: '75-84%' },
              { label: 'LEAN', color: '#3B82F6', range: '65-74%' },
              { label: 'WATCH', color: '#6B7280', range: '<65%' }
            ].map(tier => (
              <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold',
                  color: tier.color, backgroundColor: `${tier.color}20`, border: `1px solid ${tier.color}`
                }}>{tier.label}</span>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>{tier.range}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmashSpotsPage;
