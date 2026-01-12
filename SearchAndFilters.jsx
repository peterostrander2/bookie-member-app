import React, { useState, useEffect, useMemo, createContext, useContext, useCallback, useRef } from 'react';

// ============================================================================
// SEARCH & FILTERS - Priority 7F
// Global search, advanced filters, and filter presets
// ============================================================================

// Storage keys
const STORAGE_KEYS = {
  RECENT_SEARCHES: 'bookie_recent_searches',
  FILTER_PRESETS: 'bookie_filter_presets',
  ACTIVE_FILTERS: 'bookie_active_filters'
};

// ============================================================================
// SEARCHABLE DATA - Teams, Players, Navigation
// ============================================================================

const TEAMS_DATABASE = {
  NFL: [
    { id: 'KC', name: 'Kansas City Chiefs', abbr: 'KC', conference: 'AFC', division: 'West' },
    { id: 'PHI', name: 'Philadelphia Eagles', abbr: 'PHI', conference: 'NFC', division: 'East' },
    { id: 'BUF', name: 'Buffalo Bills', abbr: 'BUF', conference: 'AFC', division: 'East' },
    { id: 'SF', name: 'San Francisco 49ers', abbr: 'SF', conference: 'NFC', division: 'West' },
    { id: 'DAL', name: 'Dallas Cowboys', abbr: 'DAL', conference: 'NFC', division: 'East' },
    { id: 'MIA', name: 'Miami Dolphins', abbr: 'MIA', conference: 'AFC', division: 'East' },
    { id: 'DET', name: 'Detroit Lions', abbr: 'DET', conference: 'NFC', division: 'North' },
    { id: 'BAL', name: 'Baltimore Ravens', abbr: 'BAL', conference: 'AFC', division: 'North' },
    { id: 'CIN', name: 'Cincinnati Bengals', abbr: 'CIN', conference: 'AFC', division: 'North' },
    { id: 'JAX', name: 'Jacksonville Jaguars', abbr: 'JAX', conference: 'AFC', division: 'South' },
    { id: 'LAC', name: 'Los Angeles Chargers', abbr: 'LAC', conference: 'AFC', division: 'West' },
    { id: 'NYJ', name: 'New York Jets', abbr: 'NYJ', conference: 'AFC', division: 'East' },
    { id: 'MIN', name: 'Minnesota Vikings', abbr: 'MIN', conference: 'NFC', division: 'North' },
    { id: 'SEA', name: 'Seattle Seahawks', abbr: 'SEA', conference: 'NFC', division: 'West' },
    { id: 'GB', name: 'Green Bay Packers', abbr: 'GB', conference: 'NFC', division: 'North' },
    { id: 'LV', name: 'Las Vegas Raiders', abbr: 'LV', conference: 'AFC', division: 'West' }
  ],
  NBA: [
    { id: 'BOS', name: 'Boston Celtics', abbr: 'BOS', conference: 'East', division: 'Atlantic' },
    { id: 'LAL', name: 'Los Angeles Lakers', abbr: 'LAL', conference: 'West', division: 'Pacific' },
    { id: 'DEN', name: 'Denver Nuggets', abbr: 'DEN', conference: 'West', division: 'Northwest' },
    { id: 'MIL', name: 'Milwaukee Bucks', abbr: 'MIL', conference: 'East', division: 'Central' },
    { id: 'PHX', name: 'Phoenix Suns', abbr: 'PHX', conference: 'West', division: 'Pacific' },
    { id: 'GSW', name: 'Golden State Warriors', abbr: 'GSW', conference: 'West', division: 'Pacific' },
    { id: 'MIA', name: 'Miami Heat', abbr: 'MIA', conference: 'East', division: 'Southeast' },
    { id: 'PHI', name: 'Philadelphia 76ers', abbr: 'PHI', conference: 'East', division: 'Atlantic' },
    { id: 'DAL', name: 'Dallas Mavericks', abbr: 'DAL', conference: 'West', division: 'Southwest' },
    { id: 'CLE', name: 'Cleveland Cavaliers', abbr: 'CLE', conference: 'East', division: 'Central' },
    { id: 'NYK', name: 'New York Knicks', abbr: 'NYK', conference: 'East', division: 'Atlantic' },
    { id: 'SAC', name: 'Sacramento Kings', abbr: 'SAC', conference: 'West', division: 'Pacific' }
  ],
  MLB: [
    { id: 'LAD', name: 'Los Angeles Dodgers', abbr: 'LAD', league: 'NL', division: 'West' },
    { id: 'NYY', name: 'New York Yankees', abbr: 'NYY', league: 'AL', division: 'East' },
    { id: 'ATL', name: 'Atlanta Braves', abbr: 'ATL', league: 'NL', division: 'East' },
    { id: 'HOU', name: 'Houston Astros', abbr: 'HOU', league: 'AL', division: 'West' },
    { id: 'PHI', name: 'Philadelphia Phillies', abbr: 'PHI', league: 'NL', division: 'East' },
    { id: 'TEX', name: 'Texas Rangers', abbr: 'TEX', league: 'AL', division: 'West' },
    { id: 'TB', name: 'Tampa Bay Rays', abbr: 'TB', league: 'AL', division: 'East' },
    { id: 'BAL', name: 'Baltimore Orioles', abbr: 'BAL', league: 'AL', division: 'East' },
    { id: 'SEA', name: 'Seattle Mariners', abbr: 'SEA', league: 'AL', division: 'West' },
    { id: 'SD', name: 'San Diego Padres', abbr: 'SD', league: 'NL', division: 'West' }
  ],
  NHL: [
    { id: 'FLA', name: 'Florida Panthers', abbr: 'FLA', conference: 'East', division: 'Atlantic' },
    { id: 'EDM', name: 'Edmonton Oilers', abbr: 'EDM', conference: 'West', division: 'Pacific' },
    { id: 'BOS', name: 'Boston Bruins', abbr: 'BOS', conference: 'East', division: 'Atlantic' },
    { id: 'DAL', name: 'Dallas Stars', abbr: 'DAL', conference: 'West', division: 'Central' },
    { id: 'COL', name: 'Colorado Avalanche', abbr: 'COL', conference: 'West', division: 'Central' },
    { id: 'NYR', name: 'New York Rangers', abbr: 'NYR', conference: 'East', division: 'Metro' },
    { id: 'VGK', name: 'Vegas Golden Knights', abbr: 'VGK', conference: 'West', division: 'Pacific' },
    { id: 'CAR', name: 'Carolina Hurricanes', abbr: 'CAR', conference: 'East', division: 'Metro' },
    { id: 'TOR', name: 'Toronto Maple Leafs', abbr: 'TOR', conference: 'East', division: 'Atlantic' },
    { id: 'WPG', name: 'Winnipeg Jets', abbr: 'WPG', conference: 'West', division: 'Central' }
  ]
};

const PLAYERS_DATABASE = {
  NFL: [
    { id: 'mahomes', name: 'Patrick Mahomes', team: 'KC', position: 'QB' },
    { id: 'hurts', name: 'Jalen Hurts', team: 'PHI', position: 'QB' },
    { id: 'allen', name: 'Josh Allen', team: 'BUF', position: 'QB' },
    { id: 'purdy', name: 'Brock Purdy', team: 'SF', position: 'QB' },
    { id: 'cmc', name: 'Christian McCaffrey', team: 'SF', position: 'RB' },
    { id: 'hill', name: 'Tyreek Hill', team: 'MIA', position: 'WR' },
    { id: 'jefferson', name: 'Justin Jefferson', team: 'MIN', position: 'WR' },
    { id: 'kelce', name: 'Travis Kelce', team: 'KC', position: 'TE' },
    { id: 'lamb', name: 'CeeDee Lamb', team: 'DAL', position: 'WR' },
    { id: 'chase', name: 'Jamar Chase', team: 'CIN', position: 'WR' }
  ],
  NBA: [
    { id: 'tatum', name: 'Jayson Tatum', team: 'BOS', position: 'SF' },
    { id: 'lebron', name: 'LeBron James', team: 'LAL', position: 'SF' },
    { id: 'jokic', name: 'Nikola Jokic', team: 'DEN', position: 'C' },
    { id: 'giannis', name: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF' },
    { id: 'curry', name: 'Stephen Curry', team: 'GSW', position: 'PG' },
    { id: 'durant', name: 'Kevin Durant', team: 'PHX', position: 'SF' },
    { id: 'luka', name: 'Luka Doncic', team: 'DAL', position: 'PG' },
    { id: 'embiid', name: 'Joel Embiid', team: 'PHI', position: 'C' },
    { id: 'sga', name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'SG' },
    { id: 'ant', name: 'Anthony Edwards', team: 'MIN', position: 'SG' }
  ],
  MLB: [
    { id: 'ohtani', name: 'Shohei Ohtani', team: 'LAD', position: 'DH' },
    { id: 'judge', name: 'Aaron Judge', team: 'NYY', position: 'RF' },
    { id: 'acuna', name: 'Ronald Acuna Jr.', team: 'ATL', position: 'RF' },
    { id: 'betts', name: 'Mookie Betts', team: 'LAD', position: 'SS' },
    { id: 'trout', name: 'Mike Trout', team: 'LAA', position: 'CF' },
    { id: 'cole', name: 'Gerrit Cole', team: 'NYY', position: 'SP' },
    { id: 'degrom', name: 'Jacob deGrom', team: 'TEX', position: 'SP' },
    { id: 'verlander', name: 'Justin Verlander', team: 'HOU', position: 'SP' }
  ],
  NHL: [
    { id: 'mcdavid', name: 'Connor McDavid', team: 'EDM', position: 'C' },
    { id: 'mackinnon', name: 'Nathan MacKinnon', team: 'COL', position: 'C' },
    { id: 'draisaitl', name: 'Leon Draisaitl', team: 'EDM', position: 'C' },
    { id: 'matthews', name: 'Auston Matthews', team: 'TOR', position: 'C' },
    { id: 'kucherov', name: 'Nikita Kucherov', team: 'TB', position: 'RW' },
    { id: 'makar', name: 'Cale Makar', team: 'COL', position: 'D' },
    { id: 'vasilevskiy', name: 'Andrei Vasilevskiy', team: 'TB', position: 'G' }
  ]
};

const NAVIGATION_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', path: '/', icon: '🏠', keywords: ['home', 'main', 'overview'] },
  { id: 'smashspots', name: 'Smash Spots', path: '/smash-spots', icon: '🎯', keywords: ['picks', 'bets', 'signals'] },
  { id: 'sharp', name: 'Sharp Money', path: '/sharp-alerts', icon: '🦈', keywords: ['professional', 'wise guys', 'steam'] },
  { id: 'odds', name: 'Best Odds', path: '/best-odds', icon: '💰', keywords: ['compare', 'lines', 'value'] },
  { id: 'injuries', name: 'Injury Vacuum', path: '/injuries', icon: '🏥', keywords: ['hurt', 'out', 'questionable'] },
  { id: 'performance', name: 'Performance', path: '/performance', icon: '📊', keywords: ['history', 'record', 'stats'] },
  { id: 'bankroll', name: 'Bankroll', path: '/bankroll', icon: '💵', keywords: ['money', 'units', 'kelly'] },
  { id: 'community', name: 'Community', path: '/community', icon: '👥', keywords: ['leaderboard', 'social', 'voting'] },
  { id: 'esoteric', name: 'Esoteric', path: '/esoteric', icon: '🔮', keywords: ['gematria', 'moon', 'numerology'] },
  { id: 'analytics', name: 'Analytics', path: '/analytics', icon: '📈', keywords: ['simulator', 'hedge', 'parlay', 'arbitrage'] },
  { id: 'grading', name: 'Grading', path: '/grading', icon: '🎓', keywords: ['review', 'grade', 'learn'] },
  { id: 'settings', name: 'Settings', path: '/settings', icon: '⚙️', keywords: ['preferences', 'config', 'profile'] },
  { id: 'notifications', name: 'Notifications', path: '/notifications', icon: '🔔', keywords: ['alerts', 'push', 'email'] }
];

// ============================================================================
// FILTER DEFINITIONS
// ============================================================================

const FILTER_DEFINITIONS = {
  sport: {
    type: 'select',
    label: 'Sport',
    icon: '🏆',
    options: [
      { value: 'all', label: 'All Sports' },
      { value: 'NFL', label: 'NFL' },
      { value: 'NBA', label: 'NBA' },
      { value: 'MLB', label: 'MLB' },
      { value: 'NHL', label: 'NHL' },
      { value: 'NCAAB', label: 'NCAAB' },
      { value: 'NCAAF', label: 'NCAAF' }
    ]
  },
  result: {
    type: 'select',
    label: 'Result',
    icon: '📋',
    options: [
      { value: 'all', label: 'All Results' },
      { value: 'win', label: 'Wins' },
      { value: 'loss', label: 'Losses' },
      { value: 'push', label: 'Pushes' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  dateRange: {
    type: 'dateRange',
    label: 'Date Range',
    icon: '📅',
    presets: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'season', label: 'This Season' },
      { value: 'custom', label: 'Custom Range' }
    ]
  },
  oddsRange: {
    type: 'range',
    label: 'Odds Range',
    icon: '🎲',
    min: -500,
    max: 500,
    step: 10,
    format: (val) => val > 0 ? `+${val}` : val
  },
  confidence: {
    type: 'range',
    label: 'Confidence',
    icon: '🎯',
    min: 50,
    max: 100,
    step: 5,
    format: (val) => `${val}%`
  },
  betType: {
    type: 'multiselect',
    label: 'Bet Type',
    icon: '📝',
    options: [
      { value: 'spread', label: 'Spread' },
      { value: 'moneyline', label: 'Moneyline' },
      { value: 'total', label: 'Total (O/U)' },
      { value: 'prop', label: 'Props' },
      { value: 'parlay', label: 'Parlays' }
    ]
  },
  units: {
    type: 'range',
    label: 'Unit Size',
    icon: '💰',
    min: 0.5,
    max: 5,
    step: 0.5,
    format: (val) => `${val}u`
  }
};

const DEFAULT_PRESETS = [
  {
    id: 'high-confidence-wins',
    name: 'High Confidence Wins',
    icon: '🎯',
    filters: { confidence: [75, 100], result: 'win' }
  },
  {
    id: 'todays-action',
    name: "Today's Action",
    icon: '📅',
    filters: { dateRange: 'today', result: 'all' }
  },
  {
    id: 'plus-money-dogs',
    name: 'Plus Money Dogs',
    icon: '🐕',
    filters: { oddsRange: [100, 500] }
  },
  {
    id: 'heavy-favorites',
    name: 'Heavy Favorites',
    icon: '💪',
    filters: { oddsRange: [-500, -200] }
  },
  {
    id: 'big-unit-plays',
    name: 'Big Unit Plays',
    icon: '💰',
    filters: { units: [3, 5] }
  }
];

// ============================================================================
// CONTEXT
// ============================================================================

const SearchFilterContext = createContext(null);

export const useSearchFilter = () => {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) throw new Error('useSearchFilter must be used within SearchFilterProvider');
  return ctx;
};

export const SearchFilterProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [filterPresets, setFilterPresets] = useState(DEFAULT_PRESETS);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem(STORAGE_KEYS.FILTER_PRESETS);
    const savedSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    const savedFilters = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILTERS);

    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setFilterPresets([...DEFAULT_PRESETS, ...parsed.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id))]);
      } catch (e) {}
    }
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 10));
      } catch (e) {}
    }
    if (savedFilters) {
      try {
        setActiveFilters(JSON.parse(savedFilters));
      } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTER_PRESETS, JSON.stringify(filterPresets.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id))));
  }, [filterPresets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILTERS, JSON.stringify(activeFilters));
  }, [activeFilters]);

  // Add to recent searches
  const addRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 10);
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // Set filter
  const setFilter = useCallback((key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear single filter
  const clearFilter = useCallback((key) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId) => {
    const preset = filterPresets.find(p => p.id === presetId);
    if (preset) {
      setActiveFilters(preset.filters);
    }
  }, [filterPresets]);

  // Save custom preset
  const savePreset = useCallback((name, icon = '⭐') => {
    const newPreset = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      filters: { ...activeFilters },
      isCustom: true
    };
    setFilterPresets(prev => [...prev, newPreset]);
    return newPreset;
  }, [activeFilters]);

  // Delete preset
  const deletePreset = useCallback((presetId) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(activeFilters).filter(k => {
      const val = activeFilters[k];
      if (val === 'all' || val === undefined || val === null) return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
  }, [activeFilters]);

  const value = {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filterPresets,
    applyPreset,
    savePreset,
    deletePreset,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isSearchOpen,
    setIsSearchOpen,
    activeFilterCount
  };

  return (
    <SearchFilterContext.Provider value={value}>
      {children}
    </SearchFilterContext.Provider>
  );
};

// ============================================================================
// GLOBAL SEARCH COMPONENT
// ============================================================================

export const GlobalSearch = ({ onNavigate, onSelectTeam, onSelectPlayer }) => {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isSearchOpen,
    setIsSearchOpen
  } = useSearchFilter();

  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search results
  const results = useMemo(() => {
    if (!searchQuery.trim()) return { teams: [], players: [], navigation: [], total: 0 };

    const query = searchQuery.toLowerCase();
    const teams = [];
    const players = [];
    const navigation = [];

    // Search teams
    Object.entries(TEAMS_DATABASE).forEach(([sport, sportTeams]) => {
      sportTeams.forEach(team => {
        if (team.name.toLowerCase().includes(query) || team.abbr.toLowerCase().includes(query)) {
          teams.push({ ...team, sport });
        }
      });
    });

    // Search players
    Object.entries(PLAYERS_DATABASE).forEach(([sport, sportPlayers]) => {
      sportPlayers.forEach(player => {
        if (player.name.toLowerCase().includes(query)) {
          players.push({ ...player, sport });
        }
      });
    });

    // Search navigation
    NAVIGATION_ITEMS.forEach(item => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      ) {
        navigation.push(item);
      }
    });

    return {
      teams: teams.slice(0, 5),
      players: players.slice(0, 5),
      navigation: navigation.slice(0, 5),
      total: teams.length + players.length + navigation.length
    };
  }, [searchQuery]);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    return [
      ...results.navigation.map(r => ({ ...r, type: 'navigation' })),
      ...results.teams.map(r => ({ ...r, type: 'team' })),
      ...results.players.map(r => ({ ...r, type: 'player' }))
    ];
  }, [results]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Arrow key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      handleSelect(flatResults[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    addRecentSearch(searchQuery);
    setSearchQuery('');
    setIsSearchOpen(false);

    if (item.type === 'navigation' && onNavigate) {
      onNavigate(item.path);
    } else if (item.type === 'team' && onSelectTeam) {
      onSelectTeam(item);
    } else if (item.type === 'player' && onSelectPlayer) {
      onSelectPlayer(item);
    }
  };

  if (!isSearchOpen) {
    return (
      <button
        onClick={() => setIsSearchOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'rgba(51, 65, 85, 0.5)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderRadius: 8,
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: 14
        }}
      >
        <span>🔍</span>
        <span>Search...</span>
        <kbd style={{
          padding: '2px 6px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: 4,
          fontSize: 11,
          color: '#64748b'
        }}>
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 100,
      zIndex: 1000
    }}>
      <div style={{
        width: '100%',
        maxWidth: 600,
        background: '#1e293b',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
        }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search teams, players, or navigate..."
            style={{
              flex: 1,
              padding: 8,
              background: 'transparent',
              border: 'none',
              color: '#f1f5f9',
              fontSize: 18,
              outline: 'none'
            }}
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            style={{
              padding: '4px 8px',
              background: 'rgba(51, 65, 85, 0.5)',
              border: 'none',
              borderRadius: 4,
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {searchQuery.trim() ? (
            <>
              {/* Navigation Results */}
              {results.navigation.length > 0 && (
                <div style={{ padding: '8px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                    Pages
                  </div>
                  {results.navigation.map((item, idx) => {
                    const globalIdx = idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect({ ...item, type: 'navigation' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: 12,
                          background: selectedIndex === globalIdx ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                          border: 'none',
                          borderRadius: 8,
                          color: '#f1f5f9',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{item.path}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Team Results */}
              {results.teams.length > 0 && (
                <div style={{ padding: '8px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                    Teams
                  </div>
                  {results.teams.map((team, idx) => {
                    const globalIdx = results.navigation.length + idx;
                    return (
                      <button
                        key={`${team.sport}-${team.id}`}
                        onClick={() => handleSelect({ ...team, type: 'team' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: 12,
                          background: selectedIndex === globalIdx ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                          border: 'none',
                          borderRadius: 8,
                          color: '#f1f5f9',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: 'rgba(96, 165, 250, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#60a5fa'
                        }}>
                          {team.abbr}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{team.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{team.sport} • {team.division}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Player Results */}
              {results.players.length > 0 && (
                <div style={{ padding: '8px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                    Players
                  </div>
                  {results.players.map((player, idx) => {
                    const globalIdx = results.navigation.length + results.teams.length + idx;
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleSelect({ ...player, type: 'player' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: 12,
                          background: selectedIndex === globalIdx ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                          border: 'none',
                          borderRadius: 8,
                          color: '#f1f5f9',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(168, 85, 247, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#a855f7'
                        }}>
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{player.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {player.team} • {player.position} • {player.sport}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {results.total === 0 && (
                <div style={{
                  padding: 32,
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </>
          ) : (
            /* Recent Searches */
            <div style={{ padding: '8px 16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                  Recent Searches
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecentSearches}
                    style={{
                      padding: '2px 6px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: 11
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(search)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: 10,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      color: '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14
                    }}
                  >
                    <span style={{ color: '#64748b' }}>🕐</span>
                    {search}
                  </button>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                  No recent searches
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 12,
          borderTop: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          fontSize: 12,
          color: '#64748b'
        }}>
          <span><kbd style={{ padding: '2px 4px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 3 }}>↑↓</kbd> Navigate</span>
          <span><kbd style={{ padding: '2px 4px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 3 }}>↵</kbd> Select</span>
          <span><kbd style={{ padding: '2px 4px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 3 }}>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADVANCED FILTERS PANEL
// ============================================================================

export const AdvancedFiltersPanel = ({ availableFilters = Object.keys(FILTER_DEFINITIONS), onApply }) => {
  const {
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filterPresets,
    applyPreset,
    savePreset,
    deletePreset,
    activeFilterCount
  } = useSearchFilter();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [expandedFilter, setExpandedFilter] = useState(null);

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      savePreset(newPresetName.trim());
      setNewPresetName('');
      setShowSaveModal(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 20
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h3 style={{ color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔧</span>
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              padding: '2px 8px',
              background: '#60a5fa',
              borderRadius: 10,
              fontSize: 12,
              color: '#0f172a',
              fontWeight: 600
            }}>
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: 'none',
              borderRadius: 6,
              color: '#f87171',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Presets */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Quick Filters</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filterPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'rgba(51, 65, 85, 0.5)',
                border: 'none',
                borderRadius: 8,
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: 13,
                position: 'relative'
              }}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
              {preset.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  style={{
                    marginLeft: 4,
                    padding: '0 4px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  ×
                </button>
              )}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'rgba(96, 165, 250, 0.15)',
                border: '1px dashed rgba(96, 165, 250, 0.5)',
                borderRadius: 8,
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              <span>+</span>
              <span>Save Preset</span>
            </button>
          )}
        </div>
      </div>

      {/* Individual Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {availableFilters.map(filterKey => {
          const filter = FILTER_DEFINITIONS[filterKey];
          if (!filter) return null;

          const value = activeFilters[filterKey];
          const isActive = value !== undefined && value !== 'all' && (!Array.isArray(value) || value.length > 0);
          const isExpanded = expandedFilter === filterKey;

          return (
            <div
              key={filterKey}
              style={{
                background: 'rgba(51, 65, 85, 0.3)',
                borderRadius: 10,
                overflow: 'hidden',
                border: isActive ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent'
              }}
            >
              {/* Filter Header */}
              <button
                onClick={() => setExpandedFilter(isExpanded ? null : filterKey)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: 12,
                  background: 'none',
                  border: 'none',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{filter.icon}</span>
                  <span style={{ fontWeight: 500 }}>{filter.label}</span>
                  {isActive && (
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(96, 165, 250, 0.2)',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#60a5fa'
                    }}>
                      Active
                    </span>
                  )}
                </div>
                <span style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              </button>

              {/* Filter Content */}
              {isExpanded && (
                <div style={{ padding: '0 12px 12px' }}>
                  {filter.type === 'select' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filter.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setFilter(filterKey, opt.value)}
                          style={{
                            padding: '8px 14px',
                            background: value === opt.value ? 'rgba(96, 165, 250, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                            border: `1px solid ${value === opt.value ? '#60a5fa' : 'transparent'}`,
                            borderRadius: 6,
                            color: value === opt.value ? '#60a5fa' : '#94a3b8',
                            cursor: 'pointer',
                            fontSize: 13
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {filter.type === 'multiselect' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filter.options.map(opt => {
                        const selected = Array.isArray(value) && value.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              const current = Array.isArray(value) ? value : [];
                              const next = selected
                                ? current.filter(v => v !== opt.value)
                                : [...current, opt.value];
                              setFilter(filterKey, next);
                            }}
                            style={{
                              padding: '8px 14px',
                              background: selected ? 'rgba(96, 165, 250, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                              border: `1px solid ${selected ? '#60a5fa' : 'transparent'}`,
                              borderRadius: 6,
                              color: selected ? '#60a5fa' : '#94a3b8',
                              cursor: 'pointer',
                              fontSize: 13
                            }}
                          >
                            {selected ? '✓ ' : ''}{opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filter.type === 'range' && (
                    <div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#64748b' }}>Min</label>
                          <input
                            type="number"
                            min={filter.min}
                            max={filter.max}
                            step={filter.step}
                            value={Array.isArray(value) ? value[0] : filter.min}
                            onChange={(e) => {
                              const min = parseFloat(e.target.value);
                              const max = Array.isArray(value) ? value[1] : filter.max;
                              setFilter(filterKey, [min, max]);
                            }}
                            style={{
                              width: '100%',
                              padding: 8,
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(71, 85, 105, 0.5)',
                              borderRadius: 6,
                              color: '#f1f5f9',
                              fontSize: 14
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: '#64748b' }}>Max</label>
                          <input
                            type="number"
                            min={filter.min}
                            max={filter.max}
                            step={filter.step}
                            value={Array.isArray(value) ? value[1] : filter.max}
                            onChange={(e) => {
                              const min = Array.isArray(value) ? value[0] : filter.min;
                              const max = parseFloat(e.target.value);
                              setFilter(filterKey, [min, max]);
                            }}
                            style={{
                              width: '100%',
                              padding: 8,
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(71, 85, 105, 0.5)',
                              borderRadius: 6,
                              color: '#f1f5f9',
                              fontSize: 14
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                        {filter.format(Array.isArray(value) ? value[0] : filter.min)} — {filter.format(Array.isArray(value) ? value[1] : filter.max)}
                      </div>
                    </div>
                  )}

                  {filter.type === 'dateRange' && (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {filter.presets.map(preset => (
                          <button
                            key={preset.value}
                            onClick={() => setFilter(filterKey, preset.value)}
                            style={{
                              padding: '8px 14px',
                              background: value === preset.value ? 'rgba(96, 165, 250, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                              border: `1px solid ${value === preset.value ? '#60a5fa' : 'transparent'}`,
                              borderRadius: 6,
                              color: value === preset.value ? '#60a5fa' : '#94a3b8',
                              cursor: 'pointer',
                              fontSize: 13
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      {value === 'custom' && (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: '#64748b' }}>Start Date</label>
                            <input
                              type="date"
                              onChange={(e) => setFilter(`${filterKey}Start`, e.target.value)}
                              style={{
                                width: '100%',
                                padding: 8,
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(71, 85, 105, 0.5)',
                                borderRadius: 6,
                                color: '#f1f5f9'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: '#64748b' }}>End Date</label>
                            <input
                              type="date"
                              onChange={(e) => setFilter(`${filterKey}End`, e.target.value)}
                              style={{
                                width: '100%',
                                padding: 8,
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(71, 85, 105, 0.5)',
                                borderRadius: 6,
                                color: '#f1f5f9'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clear This Filter */}
                  {isActive && (
                    <button
                      onClick={() => clearFilter(filterKey)}
                      style={{
                        marginTop: 12,
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: 6,
                        color: '#f87171',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Clear {filter.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Apply Button */}
      {onApply && (
        <button
          onClick={() => onApply(activeFilters)}
          style={{
            width: '100%',
            marginTop: 20,
            padding: 14,
            background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 12,
            padding: 24,
            width: 400
          }}>
            <h4 style={{ color: '#f8fafc', margin: '0 0 16px' }}>Save Filter Preset</h4>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name..."
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 14,
                marginBottom: 16
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                style={{
                  flex: 1,
                  padding: 12,
                  background: newPresetName.trim() ? '#60a5fa' : '#334155',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: newPresetName.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACTIVE FILTERS BAR (Compact)
// ============================================================================

export const ActiveFiltersBar = () => {
  const { activeFilters, clearFilter, clearAllFilters, activeFilterCount } = useSearchFilter();

  if (activeFilterCount === 0) return null;

  const getFilterLabel = (key, value) => {
    const filter = FILTER_DEFINITIONS[key];
    if (!filter) return `${key}: ${value}`;

    if (filter.type === 'select') {
      const opt = filter.options.find(o => o.value === value);
      return opt ? opt.label : value;
    }
    if (filter.type === 'range' && Array.isArray(value)) {
      return `${filter.format(value[0])} - ${filter.format(value[1])}`;
    }
    if (filter.type === 'multiselect' && Array.isArray(value)) {
      return value.map(v => {
        const opt = filter.options.find(o => o.value === v);
        return opt ? opt.label : v;
      }).join(', ');
    }
    if (filter.type === 'dateRange') {
      const preset = filter.presets.find(p => p.value === value);
      return preset ? preset.label : value;
    }
    return String(value);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      background: 'rgba(96, 165, 250, 0.1)',
      borderRadius: 10,
      marginBottom: 16,
      flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 500 }}>
        Active Filters:
      </span>
      {Object.entries(activeFilters).map(([key, value]) => {
        if (value === 'all' || value === undefined) return null;
        if (Array.isArray(value) && value.length === 0) return null;
        const filter = FILTER_DEFINITIONS[key];
        if (!filter) return null;

        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: 'rgba(96, 165, 250, 0.2)',
              borderRadius: 6
            }}
          >
            <span style={{ fontSize: 12 }}>{filter.icon}</span>
            <span style={{ fontSize: 12, color: '#e2e8f0' }}>
              {getFilterLabel(key, value)}
            </span>
            <button
              onClick={() => clearFilter(key)}
              style={{
                padding: '0 4px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <button
        onClick={clearAllFilters}
        style={{
          padding: '4px 10px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: 'none',
          borderRadius: 6,
          color: '#f87171',
          cursor: 'pointer',
          fontSize: 12
        }}
      >
        Clear All
      </button>
    </div>
  );
};

// ============================================================================
// FILTER UTILITY FUNCTION
// ============================================================================

export const applyFilters = (items, filters) => {
  return items.filter(item => {
    // Sport filter
    if (filters.sport && filters.sport !== 'all') {
      if (item.sport !== filters.sport) return false;
    }

    // Result filter
    if (filters.result && filters.result !== 'all') {
      if (item.result !== filters.result) return false;
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const itemDate = new Date(item.date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case 'today':
          if (itemDate < today) return false;
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (itemDate < yesterday || itemDate >= today) return false;
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (itemDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (itemDate < monthAgo) return false;
          break;
      }
    }

    // Odds range filter
    if (filters.oddsRange && Array.isArray(filters.oddsRange)) {
      const [min, max] = filters.oddsRange;
      if (item.odds < min || item.odds > max) return false;
    }

    // Confidence filter
    if (filters.confidence && Array.isArray(filters.confidence)) {
      const [min, max] = filters.confidence;
      if (item.confidence < min || item.confidence > max) return false;
    }

    // Bet type filter
    if (filters.betType && Array.isArray(filters.betType) && filters.betType.length > 0) {
      if (!filters.betType.includes(item.betType)) return false;
    }

    // Units filter
    if (filters.units && Array.isArray(filters.units)) {
      const [min, max] = filters.units;
      if (item.units < min || item.units > max) return false;
    }

    return true;
  });
};

// ============================================================================
// SEARCH AND FILTER DASHBOARD
// ============================================================================

export const SearchFilterDashboard = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      padding: 20
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 32,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px'
        }}>
          🔍 Search & Filters
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Find teams, players, and filter your betting history
        </p>
      </div>

      {/* Global Search */}
      <div style={{ marginBottom: 24 }}>
        <GlobalSearch
          onNavigate={(path) => {
            setSelectedItem({ type: 'nav', path });
          }}
          onSelectTeam={(team) => {
            setSelectedItem({ type: 'team', ...team });
          }}
          onSelectPlayer={(player) => {
            setSelectedItem({ type: 'player', ...player });
          }}
        />
      </div>

      {/* Selected Item Display */}
      {selectedItem && (
        <div style={{
          padding: 20,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 16,
          marginBottom: 24,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <h4 style={{ color: '#f8fafc', margin: '0 0 12px' }}>Selected:</h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            background: 'rgba(96, 165, 250, 0.1)',
            borderRadius: 10
          }}>
            {selectedItem.type === 'team' && (
              <>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'rgba(96, 165, 250, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#60a5fa'
                }}>
                  {selectedItem.abbr}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedItem.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {selectedItem.sport} • {selectedItem.conference || selectedItem.league} {selectedItem.division}
                  </div>
                </div>
              </>
            )}
            {selectedItem.type === 'player' && (
              <>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#a855f7'
                }}>
                  {selectedItem.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedItem.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {selectedItem.team} • {selectedItem.position} • {selectedItem.sport}
                  </div>
                </div>
              </>
            )}
            {selectedItem.type === 'nav' && (
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Navigating to: {selectedItem.path}</div>
              </div>
            )}
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                marginLeft: 'auto',
                padding: '6px 12px',
                background: 'rgba(51, 65, 85, 0.5)',
                border: 'none',
                borderRadius: 6,
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Bar */}
      <ActiveFiltersBar />

      {/* Filters Panel */}
      <AdvancedFiltersPanel
        availableFilters={['sport', 'result', 'dateRange', 'oddsRange', 'confidence', 'betType', 'units']}
        onApply={(filters) => {
          console.log('Applied filters:', filters);
        }}
      />
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TEAMS_DATABASE,
  PLAYERS_DATABASE,
  NAVIGATION_ITEMS,
  FILTER_DEFINITIONS,
  DEFAULT_PRESETS
};

export default SearchFilterDashboard;
