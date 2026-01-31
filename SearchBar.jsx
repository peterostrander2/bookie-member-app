import React, { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// Quick search component for players, teams, games
const SearchBar = memo(({ placeholder = 'Search players, teams, games...', compact = false }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Sample data for quick search (would be replaced with API call)
  const searchData = {
    players: [
      { name: 'LeBron James', team: 'Lakers', sport: 'NBA' },
      { name: 'Stephen Curry', team: 'Warriors', sport: 'NBA' },
      { name: 'Kevin Durant', team: 'Suns', sport: 'NBA' },
      { name: 'Giannis Antetokounmpo', team: 'Bucks', sport: 'NBA' },
      { name: 'Luka Doncic', team: 'Mavericks', sport: 'NBA' },
      { name: 'Jayson Tatum', team: 'Celtics', sport: 'NBA' },
      { name: 'Nikola Jokic', team: 'Nuggets', sport: 'NBA' },
      { name: 'Joel Embiid', team: 'Sixers', sport: 'NBA' },
      { name: 'Patrick Mahomes', team: 'Chiefs', sport: 'NFL' },
      { name: 'Josh Allen', team: 'Bills', sport: 'NFL' },
      { name: 'Jalen Hurts', team: 'Eagles', sport: 'NFL' },
      { name: 'Lamar Jackson', team: 'Ravens', sport: 'NFL' },
      { name: 'Shohei Ohtani', team: 'Dodgers', sport: 'MLB' },
      { name: 'Aaron Judge', team: 'Yankees', sport: 'MLB' },
      { name: 'Mookie Betts', team: 'Dodgers', sport: 'MLB' },
      { name: 'Connor McDavid', team: 'Oilers', sport: 'NHL' },
      { name: 'Auston Matthews', team: 'Maple Leafs', sport: 'NHL' }
    ],
    teams: [
      { name: 'Los Angeles Lakers', abbr: 'LAL', sport: 'NBA' },
      { name: 'Boston Celtics', abbr: 'BOS', sport: 'NBA' },
      { name: 'Golden State Warriors', abbr: 'GSW', sport: 'NBA' },
      { name: 'Denver Nuggets', abbr: 'DEN', sport: 'NBA' },
      { name: 'Milwaukee Bucks', abbr: 'MIL', sport: 'NBA' },
      { name: 'Phoenix Suns', abbr: 'PHX', sport: 'NBA' },
      { name: 'Kansas City Chiefs', abbr: 'KC', sport: 'NFL' },
      { name: 'Philadelphia Eagles', abbr: 'PHI', sport: 'NFL' },
      { name: 'Buffalo Bills', abbr: 'BUF', sport: 'NFL' },
      { name: 'San Francisco 49ers', abbr: 'SF', sport: 'NFL' },
      { name: 'New York Yankees', abbr: 'NYY', sport: 'MLB' },
      { name: 'Los Angeles Dodgers', abbr: 'LAD', sport: 'MLB' },
      { name: 'Toronto Maple Leafs', abbr: 'TOR', sport: 'NHL' },
      { name: 'Edmonton Oilers', abbr: 'EDM', sport: 'NHL' }
    ]
  };

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = query.toLowerCase();

    // Filter players
    const matchedPlayers = searchData.players
      .filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ ...p, type: 'player', icon: '👤' }));

    // Filter teams
    const matchedTeams = searchData.teams
      .filter(t => t.name.toLowerCase().includes(q) || t.abbr.toLowerCase().includes(q))
      .slice(0, 3)
      .map(t => ({ ...t, type: 'team', icon: '🏀' }));

    setResults([...matchedPlayers, ...matchedTeams]);
    setLoading(false);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle result click
  const handleResultClick = (result) => {
    if (result.type === 'player') {
      // Navigate to props page with player filter
      navigate(`/smash-spots?search=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'team') {
      // Navigate to smash spots with team filter
      navigate(`/smash-spots?search=${encodeURIComponent(result.name)}`);
    }
    setQuery('');
    setIsOpen(false);
  };

  // Get sport badge color
  const getSportColor = (sport) => {
    const colors = {
      NBA: '#F97316',
      NFL: '#10B981',
      MLB: '#EF4444',
      NHL: '#3B82F6'
    };
    return colors[sport] || '#6b7280';
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: compact ? '200px' : '100%', maxWidth: '400px' }}>
      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        border: isOpen && query.length >= 2 ? '1px solid #00D4FF' : '1px solid #333',
        borderRadius: '10px',
        padding: compact ? '8px 12px' : '10px 14px',
        transition: 'border-color 0.2s'
      }}>
        <span style={{ color: '#6b7280', marginRight: '10px', fontSize: compact ? '14px' : '16px' }}>🔍</span>
        <input
          ref={inputRef}
          id="global-search"
          name="globalSearch"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: compact ? '13px' : '14px'
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '2px',
              fontSize: '14px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          backgroundColor: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '10px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              No results for "{query}"
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252540'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '18px' }}>{result.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>
                      {result.name}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {result.type === 'player' ? result.team : result.abbr}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: getSportColor(result.sport) + '25',
                    color: getSportColor(result.sport),
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {result.sport}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick actions footer */}
          {results.length > 0 && (
            <div style={{
              borderTop: '1px solid #333',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>
                Press Enter to search all
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
