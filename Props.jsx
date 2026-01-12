import React, { useState, useEffect } from 'react';
import api from './api';
import { useToast } from './Toast';
import { AddToSlipButton } from './BetSlip';

const Props = () => {
  const toast = useToast();
  const [sport, setSport] = useState('NBA');
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, points, rebounds, assists, etc.
  const [sortBy, setSortBy] = useState('confidence');

  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];

  const propTypes = {
    NBA: ['all', 'points', 'rebounds', 'assists', 'threes', 'blocks', 'steals', 'pra'],
    NFL: ['all', 'passing_yards', 'rushing_yards', 'receiving_yards', 'touchdowns', 'receptions'],
    MLB: ['all', 'hits', 'runs', 'rbis', 'strikeouts', 'total_bases'],
    NHL: ['all', 'goals', 'assists', 'points', 'shots', 'saves']
  };

  useEffect(() => {
    fetchProps();
  }, [sport]);

  const fetchProps = async () => {
    setLoading(true);
    try {
      const response = await api.getLiveProps(sport);
      // Handle different response formats
      const propsData = response?.data || response || [];
      setProps(Array.isArray(propsData) ? propsData : []);
    } catch (err) {
      console.error('Error fetching props:', err);
      setProps([]);
      toast.error('Failed to load props data');
    }
    setLoading(false);
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 75) return '#00FF88';
    if (conf >= 60) return '#00D4FF';
    if (conf >= 50) return '#FFD700';
    return '#9ca3af';
  };

  const getEdgeColor = (edge) => {
    if (edge >= 10) return '#00FF88';
    if (edge >= 5) return '#00D4FF';
    if (edge >= 0) return '#FFD700';
    return '#FF4444';
  };

  const formatPropType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  // Filter and sort props
  const filteredProps = props
    .filter(prop => {
      if (filter === 'all') return true;
      return prop.prop_type?.toLowerCase().includes(filter.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') {
        return (b.confidence || 0) - (a.confidence || 0);
      } else if (sortBy === 'edge') {
        return (b.edge || 0) - (a.edge || 0);
      } else if (sortBy === 'player') {
        return (a.player_name || '').localeCompare(b.player_name || '');
      }
      return 0;
    });

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎯 Player Props
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            AI-analyzed player prop bets with edge detection
          </p>
        </div>

        {/* Sport Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => { setSport(s); setFilter('all'); }}
              style={{
                padding: '10px 20px',
                backgroundColor: sport === s ? '#00D4FF' : '#1a1a2e',
                color: sport === s ? '#000' : '#9ca3af',
                border: sport === s ? 'none' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: sport === s ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {/* Prop Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Type:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {propTypes[sport]?.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: filter === type ? '#00D4FF' : '#0a0a0f',
                    color: filter === type ? '#000' : '#9ca3af',
                    border: filter === type ? 'none' : '1px solid #444',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}
                >
                  {type === 'all' ? 'All' : formatPropType(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0a0a0f',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            >
              <option value="confidence">Confidence</option>
              <option value="edge">Edge</option>
              <option value="player">Player Name</option>
            </select>
          </div>

          {/* Count */}
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>
            {filteredProps.length} props
          </div>
        </div>

        {/* Props Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
            Loading props...
          </div>
        ) : filteredProps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#1a1a2e', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Props Available</h3>
            <p>Check back closer to game time for {sport} player props.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
            {filteredProps.map((prop, idx) => {
              const confidence = prop.confidence || 0;
              const edge = prop.edge || 0;
              const confColor = getConfidenceColor(confidence);
              const edgeColor = getEdgeColor(edge);

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '12px',
                    padding: '16px',
                    borderLeft: `4px solid ${confColor}`,
                    border: '1px solid #333'
                  }}
                >
                  {/* Player & Game */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {prop.player_name || 'Unknown Player'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {prop.team || ''} {prop.game ? `• ${prop.game}` : ''}
                    </div>
                  </div>

                  {/* Prop Details */}
                  <div style={{
                    backgroundColor: '#0a0a0f',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>
                        {formatPropType(prop.prop_type)}
                      </span>
                      <span style={{
                        backgroundColor: confColor + '20',
                        color: confColor,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {confidence}% conf
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                          {prop.pick || prop.recommendation || 'OVER'} {prop.line || ''}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          Odds: {prop.odds || '-110'}
                        </div>
                      </div>

                      {edge > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: edgeColor, fontSize: '18px', fontWeight: 'bold' }}>
                            +{edge.toFixed(1)}%
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '11px' }}>edge</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Factors */}
                  {prop.factors && prop.factors.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>KEY FACTORS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {prop.factors.slice(0, 3).map((factor, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: '#0a0a0f',
                              color: '#9ca3af',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid #333',
                    gap: '10px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                      Best at: {prop.book || 'Multiple'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const text = `${prop.player_name} ${prop.pick || 'OVER'} ${prop.line} ${formatPropType(prop.prop_type)} (${prop.odds || '-110'})`;
                          navigator.clipboard.writeText(text);
                          toast.info('Copied to clipboard');
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        📋
                      </button>
                      <AddToSlipButton
                        pick={{
                          id: `${prop.player_name}_${prop.prop_type}_${prop.line}`,
                          game_id: prop.game_id || `${prop.player_name}_${idx}`,
                          player: prop.player_name,
                          team: prop.team,
                          sport: sport,
                          bet_type: 'prop',
                          side: prop.pick || prop.recommendation || 'OVER',
                          line: prop.line,
                          stat: prop.prop_type,
                          odds: prop.odds || -110,
                          confidence: confidence,
                          edge: edge
                        }}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          marginTop: '25px',
          padding: '15px 20px',
          backgroundColor: '#1a1a2e',
          borderRadius: '10px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>ABOUT PLAYER PROPS</div>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            Our AI analyzes player performance trends, matchups, and market inefficiencies
            to identify edge opportunities in player prop markets. Focus on props with 65%+
            confidence and positive expected value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Props;
