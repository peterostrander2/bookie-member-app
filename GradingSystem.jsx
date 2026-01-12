import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';

// ============================================================================
// GRADING SYSTEM - Priority 7D
// Pick grading interface, insights, and pattern analysis
// ============================================================================

// Grade definitions with colors and descriptions
const GRADE_SCALE = {
  'A+': { label: 'A+', score: 4.3, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', desc: 'Perfect execution, all signals aligned' },
  'A':  { label: 'A',  score: 4.0, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', desc: 'Excellent pick, strong process' },
  'A-': { label: 'A-', score: 3.7, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', desc: 'Very good, minor improvements possible' },
  'B+': { label: 'B+', score: 3.3, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', desc: 'Good pick, solid reasoning' },
  'B':  { label: 'B',  score: 3.0, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', desc: 'Above average execution' },
  'B-': { label: 'B-', score: 2.7, color: '#93c5fd', bg: 'rgba(147, 197, 253, 0.12)', desc: 'Decent, room for improvement' },
  'C+': { label: 'C+', score: 2.3, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', desc: 'Average pick, mixed signals' },
  'C':  { label: 'C',  score: 2.0, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', desc: 'Mediocre, needs work' },
  'C-': { label: 'C-', score: 1.7, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', desc: 'Below average process' },
  'D+': { label: 'D+', score: 1.3, color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', desc: 'Poor pick, ignored warnings' },
  'D':  { label: 'D',  score: 1.0, color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', desc: 'Bad decision making' },
  'D-': { label: 'D-', score: 0.7, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)', desc: 'Very poor, tilt likely' },
  'F':  { label: 'F',  score: 0.0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', desc: 'Failed pick, learn from this' }
};

// Categories for grading notes
const GRADING_CATEGORIES = {
  process: {
    label: 'Process',
    icon: '🧠',
    options: [
      { id: 'signals_aligned', label: 'All signals aligned', positive: true },
      { id: 'sharp_backed', label: 'Sharp money confirmed', positive: true },
      { id: 'clv_positive', label: 'Got positive CLV', positive: true },
      { id: 'right_size', label: 'Proper unit sizing', positive: true },
      { id: 'ignored_signals', label: 'Ignored warning signals', positive: false },
      { id: 'chased', label: 'Chased after loss', positive: false },
      { id: 'oversized', label: 'Oversized the bet', positive: false },
      { id: 'fomo', label: 'FOMO bet', positive: false }
    ]
  },
  timing: {
    label: 'Timing',
    icon: '⏰',
    options: [
      { id: 'early_value', label: 'Got early line value', positive: true },
      { id: 'steam_ride', label: 'Rode the steam move', positive: true },
      { id: 'late_sharp', label: 'Late sharp confirmation', positive: true },
      { id: 'bad_timing', label: 'Bad timing on entry', positive: false },
      { id: 'missed_move', label: 'Missed the line move', positive: false },
      { id: 'live_tilt', label: 'Live bet tilt', positive: false }
    ]
  },
  analysis: {
    label: 'Analysis',
    icon: '📊',
    options: [
      { id: 'model_edge', label: 'Model showed edge', positive: true },
      { id: 'matchup_correct', label: 'Matchup analysis correct', positive: true },
      { id: 'injury_factor', label: 'Injury impact considered', positive: true },
      { id: 'weather_check', label: 'Weather factored in', positive: true },
      { id: 'missed_injury', label: 'Missed key injury', positive: false },
      { id: 'wrong_matchup', label: 'Misjudged matchup', positive: false },
      { id: 'public_trap', label: 'Fell for public trap', positive: false }
    ]
  },
  outcome: {
    label: 'Outcome',
    icon: '🎯',
    options: [
      { id: 'crushed', label: 'Crushed it easily', positive: true },
      { id: 'sweated', label: 'Sweated but won', positive: true },
      { id: 'bad_beat', label: 'Bad beat loss', positive: false },
      { id: 'never_close', label: 'Never had a chance', positive: false },
      { id: 'backdoor', label: 'Backdoor cover/loss', positive: false }
    ]
  }
};

// Quick tags for common scenarios
const QUICK_TAGS = [
  { id: 'sharp_fade', label: '🦈 Sharp Fade', desc: 'Faded public, sharp aligned' },
  { id: 'steam_move', label: '🔥 Steam Move', desc: 'Caught steam move early' },
  { id: 'model_pick', label: '🤖 Model Pick', desc: 'AI model recommended' },
  { id: 'gut_feel', label: '🎲 Gut Feel', desc: 'Intuition-based pick' },
  { id: 'revenge', label: '😤 Revenge Bet', desc: 'Betting against team that beat you' },
  { id: 'public_fade', label: '📉 Public Fade', desc: 'Contrarian play' },
  { id: 'trap_game', label: '⚠️ Trap Game', desc: 'Spotted trap situation' },
  { id: 'value_bet', label: '💰 Value Bet', desc: 'Clear +EV opportunity' }
];

// Storage key
const STORAGE_KEY = 'bookie_grading_data';

// ============================================================================
// CONTEXT
// ============================================================================

const GradingContext = createContext(null);

export const useGrading = () => {
  const ctx = useContext(GradingContext);
  if (!ctx) throw new Error('useGrading must be used within GradingProvider');
  return ctx;
};

export const GradingProvider = ({ children }) => {
  const [gradedPicks, setGradedPicks] = useState([]);
  const [pendingGrades, setPendingGrades] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGradedPicks(data.gradedPicks || []);
        setPendingGrades(data.pendingGrades || []);
      } catch (e) {
        console.error('Failed to load grading data:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      gradedPicks,
      pendingGrades
    }));
  }, [gradedPicks, pendingGrades]);

  // Add a pick to pending grades (called when game ends)
  const addPendingGrade = useCallback((pick) => {
    setPendingGrades(prev => {
      if (prev.find(p => p.id === pick.id)) return prev;
      return [...prev, { ...pick, addedAt: Date.now() }];
    });
  }, []);

  // Grade a pick
  const gradePick = useCallback((pickId, gradeData) => {
    const pick = pendingGrades.find(p => p.id === pickId);
    if (!pick) return;

    const gradedPick = {
      ...pick,
      grade: gradeData.grade,
      notes: gradeData.notes,
      tags: gradeData.tags,
      categories: gradeData.categories,
      gradedAt: Date.now()
    };

    setGradedPicks(prev => [...prev, gradedPick]);
    setPendingGrades(prev => prev.filter(p => p.id !== pickId));
  }, [pendingGrades]);

  // Update an existing grade
  const updateGrade = useCallback((pickId, gradeData) => {
    setGradedPicks(prev => prev.map(p =>
      p.id === pickId
        ? { ...p, ...gradeData, updatedAt: Date.now() }
        : p
    ));
  }, []);

  // Delete a graded pick
  const deleteGrade = useCallback((pickId) => {
    setGradedPicks(prev => prev.filter(p => p.id !== pickId));
  }, []);

  // Dismiss pending without grading
  const dismissPending = useCallback((pickId) => {
    setPendingGrades(prev => prev.filter(p => p.id !== pickId));
  }, []);

  const value = {
    gradedPicks,
    pendingGrades,
    addPendingGrade,
    gradePick,
    updateGrade,
    deleteGrade,
    dismissPending
  };

  return (
    <GradingContext.Provider value={value}>
      {children}
    </GradingContext.Provider>
  );
};

// ============================================================================
// GRADE SELECTOR COMPONENT
// ============================================================================

const GradeSelector = ({ selected, onSelect }) => {
  const grades = Object.keys(GRADE_SCALE);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 12,
        display: 'block',
        fontWeight: 600
      }}>
        Select Grade
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 8
      }}>
        {grades.map(grade => {
          const info = GRADE_SCALE[grade];
          const isSelected = selected === grade;

          return (
            <button
              key={grade}
              onClick={() => onSelect(grade)}
              style={{
                padding: '12px 8px',
                background: isSelected ? info.bg : 'rgba(51, 65, 85, 0.5)',
                border: `2px solid ${isSelected ? info.color : 'transparent'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: isSelected ? info.color : '#64748b'
              }}>
                {grade}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: GRADE_SCALE[selected].bg,
          borderRadius: 8,
          borderLeft: `3px solid ${GRADE_SCALE[selected].color}`
        }}>
          <span style={{ color: GRADE_SCALE[selected].color, fontWeight: 600 }}>
            {GRADE_SCALE[selected].desc}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CATEGORY CHECKLIST COMPONENT
// ============================================================================

const CategoryChecklist = ({ selected, onToggle }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 12,
        display: 'block',
        fontWeight: 600
      }}>
        What Happened? (select all that apply)
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {Object.entries(GRADING_CATEGORIES).map(([catKey, category]) => (
          <div
            key={catKey}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: 12,
              padding: 16
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12
            }}>
              <span style={{ fontSize: 18 }}>{category.icon}</span>
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{category.label}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {category.options.map(opt => {
                const isSelected = selected.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      background: isSelected
                        ? (opt.positive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                        : 'transparent',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(opt.id)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: opt.positive ? '#22c55e' : '#ef4444'
                      }}
                    />
                    <span style={{
                      fontSize: 13,
                      color: isSelected
                        ? (opt.positive ? '#4ade80' : '#f87171')
                        : '#94a3b8'
                    }}>
                      {opt.positive ? '✓' : '✗'} {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// QUICK TAGS COMPONENT
// ============================================================================

const QuickTags = ({ selected, onToggle }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 12,
        display: 'block',
        fontWeight: 600
      }}>
        Quick Tags
      </label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {QUICK_TAGS.map(tag => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onToggle(tag.id)}
              title={tag.desc}
              style={{
                padding: '8px 14px',
                background: isSelected ? 'rgba(96, 165, 250, 0.2)' : 'rgba(51, 65, 85, 0.5)',
                border: `1px solid ${isSelected ? '#60a5fa' : 'transparent'}`,
                borderRadius: 20,
                color: isSelected ? '#60a5fa' : '#94a3b8',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// GRADING MODAL COMPONENT
// ============================================================================

export const GradingModal = ({ pick, onClose, onSave }) => {
  const [grade, setGrade] = useState(pick?.grade || null);
  const [notes, setNotes] = useState(pick?.notes || '');
  const [selectedTags, setSelectedTags] = useState(pick?.tags || []);
  const [selectedCategories, setSelectedCategories] = useState(pick?.categories || []);

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = () => {
    if (!grade) return;
    onSave({
      grade,
      notes,
      tags: selectedTags,
      categories: selectedCategories
    });
  };

  if (!pick) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: 16,
        maxWidth: 800,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: 20,
          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#f8fafc', fontSize: 20 }}>
              Grade Your Pick
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Review and learn from this pick
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Pick Summary */}
        <div style={{
          padding: 20,
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc' }}>
                {pick.team} {pick.spread || pick.line}
              </div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                {pick.opponent} • {pick.sport} • {new Date(pick.date).toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: pick.result === 'win' ? '#22c55e' : '#ef4444'
              }}>
                {pick.result === 'win' ? '✓ WON' : '✗ LOST'}
              </div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                {pick.odds > 0 ? '+' : ''}{pick.odds} • {pick.units}u
              </div>
            </div>
          </div>
        </div>

        {/* Grading Form */}
        <div style={{ padding: 20 }}>
          <GradeSelector selected={grade} onSelect={setGrade} />
          <QuickTags selected={selectedTags} onToggle={handleTagToggle} />
          <CategoryChecklist selected={selectedCategories} onToggle={handleCategoryToggle} />

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 14,
              color: '#94a3b8',
              marginBottom: 8,
              display: 'block',
              fontWeight: 600
            }}>
              Notes (what went well/wrong)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn from this pick? What would you do differently?"
              style={{
                width: '100%',
                minHeight: 100,
                padding: 12,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: 20,
          borderTop: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
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
            onClick={handleSave}
            disabled={!grade}
            style={{
              padding: '10px 24px',
              background: grade ? '#22c55e' : '#334155',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 600,
              cursor: grade ? 'pointer' : 'not-allowed',
              opacity: grade ? 1 : 0.5
            }}
          >
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PENDING GRADES BANNER
// ============================================================================

export const PendingGradesBanner = () => {
  const { pendingGrades, gradePick, dismissPending } = useGrading();
  const [showModal, setShowModal] = useState(false);
  const [activePick, setActivePick] = useState(null);

  if (pendingGrades.length === 0) return null;

  const handleGrade = (pick) => {
    setActivePick(pick);
    setShowModal(true);
  };

  const handleSave = (gradeData) => {
    gradePick(activePick.id, gradeData);
    setShowModal(false);
    setActivePick(null);
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>📝</span>
          <div>
            <div style={{ fontWeight: 600, color: '#fbbf24' }}>
              {pendingGrades.length} Pick{pendingGrades.length > 1 ? 's' : ''} Ready to Grade
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Review your completed picks to improve future performance
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingGrades.slice(0, 3).map(pick => (
            <div
              key={pick.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 8
              }}
            >
              <div>
                <span style={{ fontWeight: 500, color: '#f1f5f9' }}>
                  {pick.team} {pick.spread || pick.line}
                </span>
                <span style={{
                  marginLeft: 12,
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: pick.result === 'win' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: pick.result === 'win' ? '#4ade80' : '#f87171'
                }}>
                  {pick.result === 'win' ? 'WON' : 'LOST'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => dismissPending(pick.id)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#64748b',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => handleGrade(pick)}
                  style={{
                    padding: '6px 14px',
                    background: '#fbbf24',
                    border: 'none',
                    borderRadius: 6,
                    color: '#0f172a',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Grade
                </button>
              </div>
            </div>
          ))}

          {pendingGrades.length > 3 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              +{pendingGrades.length - 3} more picks to grade
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <GradingModal
          pick={activePick}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

// ============================================================================
// GRADING INSIGHTS COMPONENT
// ============================================================================

export const GradingInsights = () => {
  const { gradedPicks } = useGrading();

  const insights = useMemo(() => {
    if (gradedPicks.length < 5) return null;

    // Calculate stats by grade
    const gradeStats = {};
    gradedPicks.forEach(pick => {
      if (!gradeStats[pick.grade]) {
        gradeStats[pick.grade] = { wins: 0, losses: 0, total: 0 };
      }
      gradeStats[pick.grade].total++;
      if (pick.result === 'win') gradeStats[pick.grade].wins++;
      else gradeStats[pick.grade].losses++;
    });

    // Calculate win rate by grade
    const gradePerformance = Object.entries(gradeStats)
      .map(([grade, stats]) => ({
        grade,
        winRate: stats.total > 0 ? (stats.wins / stats.total * 100) : 0,
        total: stats.total
      }))
      .sort((a, b) => GRADE_SCALE[b.grade].score - GRADE_SCALE[a.grade].score);

    // Find patterns in losses
    const lossPatterns = {};
    gradedPicks.filter(p => p.result === 'loss').forEach(pick => {
      (pick.categories || []).forEach(cat => {
        if (!lossPatterns[cat]) lossPatterns[cat] = 0;
        lossPatterns[cat]++;
      });
    });

    const topLossReasons = Object.entries(lossPatterns)
      .map(([cat, count]) => {
        let label = cat;
        Object.values(GRADING_CATEGORIES).forEach(category => {
          const opt = category.options.find(o => o.id === cat);
          if (opt) label = opt.label;
        });
        return { category: cat, label, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Win patterns
    const winPatterns = {};
    gradedPicks.filter(p => p.result === 'win').forEach(pick => {
      (pick.categories || []).forEach(cat => {
        if (!winPatterns[cat]) winPatterns[cat] = 0;
        winPatterns[cat]++;
      });
    });

    const topWinFactors = Object.entries(winPatterns)
      .map(([cat, count]) => {
        let label = cat;
        Object.values(GRADING_CATEGORIES).forEach(category => {
          const opt = category.options.find(o => o.id === cat);
          if (opt) label = opt.label;
        });
        return { category: cat, label, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average grade
    const avgScore = gradedPicks.reduce((sum, p) => sum + GRADE_SCALE[p.grade].score, 0) / gradedPicks.length;
    let avgGrade = 'C';
    Object.entries(GRADE_SCALE).forEach(([grade, info]) => {
      if (Math.abs(info.score - avgScore) < Math.abs(GRADE_SCALE[avgGrade].score - avgScore)) {
        avgGrade = grade;
      }
    });

    return {
      gradePerformance,
      topLossReasons,
      topWinFactors,
      avgGrade,
      avgScore,
      totalGraded: gradedPicks.length
    };
  }, [gradedPicks]);

  if (!insights) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>Not Enough Data Yet</h3>
        <p style={{ color: '#64748b', margin: 0 }}>
          Grade at least 5 picks to see insights
        </p>
        <div style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(96, 165, 250, 0.1)',
          borderRadius: 8,
          color: '#60a5fa',
          fontSize: 14
        }}>
          {gradedPicks.length}/5 picks graded
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🎓</span>
        Grading Insights
      </h3>

      {/* Overall Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: GRADE_SCALE[insights.avgGrade].color
          }}>
            {insights.avgGrade}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Average Grade</div>
        </div>

        <div style={{
          background: 'rgba(96, 165, 250, 0.1)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#60a5fa' }}>
            {insights.totalGraded}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Picks Graded</div>
        </div>

        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24' }}>
            {(insights.avgScore).toFixed(1)}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>GPA Score</div>
        </div>
      </div>

      {/* Grade Performance */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 15 }}>
          Win Rate by Grade
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.gradePerformance.map(({ grade, winRate, total }) => (
            <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                fontWeight: 700,
                color: GRADE_SCALE[grade].color
              }}>
                {grade}
              </div>
              <div style={{ flex: 1, height: 24, background: 'rgba(51, 65, 85, 0.5)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${winRate}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${GRADE_SCALE[grade].color}, ${GRADE_SCALE[grade].color}88)`,
                  borderRadius: 4,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ width: 80, textAlign: 'right', fontSize: 13 }}>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{winRate.toFixed(0)}%</span>
                <span style={{ color: '#64748b' }}> ({total})</span>
              </div>
            </div>
          ))}
        </div>

        {insights.gradePerformance.some(g => g.grade.startsWith('A') && g.winRate > 75) && (
          <div style={{
            marginTop: 12,
            padding: 12,
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 8,
            borderLeft: '3px solid #22c55e'
          }}>
            <span style={{ color: '#4ade80' }}>
              💡 Your A-grade picks hit at {insights.gradePerformance.find(g => g.grade === 'A')?.winRate.toFixed(0) || 80}%!
              Trust your process when signals align.
            </span>
          </div>
        )}
      </div>

      {/* Loss Patterns */}
      {insights.topLossReasons.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 15 }}>
            Most Losses Came From...
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {insights.topLossReasons.map(({ label, count }) => (
              <div
                key={label}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  borderRadius: 8,
                  color: '#f87171',
                  fontSize: 13
                }}
              >
                ✗ {label} <span style={{ opacity: 0.7 }}>({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Win Factors */}
      {insights.topWinFactors.length > 0 && (
        <div>
          <h4 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 15 }}>
            Winning Formula
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {insights.topWinFactors.map(({ label, count }) => (
              <div
                key={label}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: 8,
                  color: '#4ade80',
                  fontSize: 13
                }}
              >
                ✓ {label} <span style={{ opacity: 0.7 }}>({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WEEKLY REVIEW COMPONENT
// ============================================================================

export const WeeklyReview = () => {
  const { gradedPicks } = useGrading();
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Group picks by week
  const weeklyData = useMemo(() => {
    const weeks = [];
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < 8; i++) {
      const weekStart = now - (i + 1) * weekMs;
      const weekEnd = now - i * weekMs;

      const weekPicks = gradedPicks.filter(p => {
        const pickDate = p.gradedAt || p.date;
        return pickDate >= weekStart && pickDate < weekEnd;
      });

      if (weekPicks.length > 0 || i < 4) {
        weeks.push({
          index: i,
          label: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} Weeks Ago`,
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd),
          picks: weekPicks,
          wins: weekPicks.filter(p => p.result === 'win').length,
          losses: weekPicks.filter(p => p.result === 'loss').length
        });
      }
    }

    return weeks;
  }, [gradedPicks]);

  const currentWeek = weeklyData[selectedWeek];

  // Analyze current week
  const weekAnalysis = useMemo(() => {
    if (!currentWeek || currentWeek.picks.length === 0) return null;

    const picks = currentWeek.picks;

    // Sport breakdown
    const bySport = {};
    picks.forEach(p => {
      if (!bySport[p.sport]) bySport[p.sport] = { wins: 0, losses: 0 };
      if (p.result === 'win') bySport[p.sport].wins++;
      else bySport[p.sport].losses++;
    });

    // Grade distribution
    const byGrade = {};
    picks.forEach(p => {
      if (!byGrade[p.grade]) byGrade[p.grade] = 0;
      byGrade[p.grade]++;
    });

    // Average grade
    const avgScore = picks.reduce((sum, p) => sum + GRADE_SCALE[p.grade].score, 0) / picks.length;

    // Biggest lesson (most common loss category)
    const lossCategories = {};
    picks.filter(p => p.result === 'loss').forEach(p => {
      (p.categories || []).forEach(cat => {
        if (!lossCategories[cat]) lossCategories[cat] = 0;
        lossCategories[cat]++;
      });
    });

    const biggestLesson = Object.entries(lossCategories)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      bySport,
      byGrade,
      avgScore,
      biggestLesson,
      totalPicks: picks.length,
      winRate: picks.length > 0 ? (currentWeek.wins / picks.length * 100) : 0
    };
  }, [currentWeek]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>📅</span>
        Weekly Review
      </h3>

      {/* Week Selector */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 8
      }}>
        {weeklyData.map((week, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedWeek(idx)}
            style={{
              padding: '10px 16px',
              background: selectedWeek === idx ? 'rgba(96, 165, 250, 0.2)' : 'rgba(51, 65, 85, 0.5)',
              border: `1px solid ${selectedWeek === idx ? '#60a5fa' : 'transparent'}`,
              borderRadius: 8,
              color: selectedWeek === idx ? '#60a5fa' : '#94a3b8',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>{week.label}</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              {week.picks.length > 0 ? (
                <span>
                  <span style={{ color: '#4ade80' }}>{week.wins}W</span>
                  {' - '}
                  <span style={{ color: '#f87171' }}>{week.losses}L</span>
                </span>
              ) : (
                <span style={{ opacity: 0.5 }}>No picks</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Week Details */}
      {currentWeek && currentWeek.picks.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>
                {weekAnalysis?.winRate.toFixed(0)}%
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Win Rate</div>
            </div>

            <div style={{
              background: 'rgba(96, 165, 250, 0.1)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>
                {weekAnalysis?.totalPicks}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Picks</div>
            </div>

            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
                {weekAnalysis?.avgScore.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Avg GPA</div>
            </div>

            <div style={{
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>
                {currentWeek.wins}-{currentWeek.losses}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Record</div>
            </div>
          </div>

          {/* Sport Breakdown */}
          {weekAnalysis && Object.keys(weekAnalysis.bySport).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 15 }}>
                By Sport
              </h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Object.entries(weekAnalysis.bySport).map(([sport, stats]) => {
                  const winRate = (stats.wins / (stats.wins + stats.losses) * 100);
                  return (
                    <div
                      key={sport}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(51, 65, 85, 0.5)',
                        borderRadius: 8,
                        minWidth: 100
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{sport}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        <span style={{ color: '#4ade80' }}>{stats.wins}W</span>
                        {' - '}
                        <span style={{ color: '#f87171' }}>{stats.losses}L</span>
                        <span style={{ marginLeft: 8, color: winRate >= 50 ? '#4ade80' : '#f87171' }}>
                          ({winRate.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Biggest Lesson */}
          {weekAnalysis?.biggestLesson && (
            <div style={{
              padding: 16,
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 12,
              borderLeft: '3px solid #ef4444'
            }}>
              <div style={{ fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
                📚 Week's Biggest Lesson
              </div>
              <div style={{ color: '#f1f5f9' }}>
                {(() => {
                  let label = weekAnalysis.biggestLesson[0];
                  Object.values(GRADING_CATEGORIES).forEach(category => {
                    const opt = category.options.find(o => o.id === weekAnalysis.biggestLesson[0]);
                    if (opt) label = opt.label;
                  });
                  return `"${label}" appeared in ${weekAnalysis.biggestLesson[1]} of your losses. Focus on avoiding this pattern.`;
                })()}
              </div>
            </div>
          )}

          {/* Individual Picks */}
          <div style={{ marginTop: 24 }}>
            <h4 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 15 }}>
              Graded Picks
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentWeek.picks.map(pick => (
                <div
                  key={pick.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: 'rgba(51, 65, 85, 0.3)',
                    borderRadius: 8
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: GRADE_SCALE[pick.grade].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: GRADE_SCALE[pick.grade].color
                  }}>
                    {pick.grade}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#f1f5f9' }}>
                      {pick.team} {pick.spread || pick.line}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {pick.sport} • {pick.odds > 0 ? '+' : ''}{pick.odds}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: pick.result === 'win' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: pick.result === 'win' ? '#4ade80' : '#f87171',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {pick.result === 'win' ? 'WON' : 'LOST'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#64748b'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div>No graded picks for this week</div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PATTERN DETECTOR COMPONENT
// ============================================================================

export const PatternDetector = () => {
  const { gradedPicks } = useGrading();

  const patterns = useMemo(() => {
    if (gradedPicks.length < 10) return null;

    const detected = [];

    // Analyze by day of week
    const byDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    gradedPicks.forEach(pick => {
      const day = new Date(pick.date).getDay();
      byDay[day].push(pick);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Object.entries(byDay).forEach(([day, picks]) => {
      if (picks.length >= 3) {
        const winRate = picks.filter(p => p.result === 'win').length / picks.length * 100;
        if (winRate >= 70) {
          detected.push({
            type: 'positive',
            icon: '📆',
            title: `Strong on ${dayNames[day]}s`,
            detail: `${winRate.toFixed(0)}% win rate (${picks.length} picks)`
          });
        } else if (winRate <= 35) {
          detected.push({
            type: 'negative',
            icon: '⚠️',
            title: `Struggling on ${dayNames[day]}s`,
            detail: `Only ${winRate.toFixed(0)}% win rate (${picks.length} picks). Consider sitting out.`
          });
        }
      }
    });

    // Analyze by sport
    const bySport = {};
    gradedPicks.forEach(pick => {
      if (!bySport[pick.sport]) bySport[pick.sport] = [];
      bySport[pick.sport].push(pick);
    });

    Object.entries(bySport).forEach(([sport, picks]) => {
      if (picks.length >= 5) {
        const winRate = picks.filter(p => p.result === 'win').length / picks.length * 100;
        const avgGrade = picks.reduce((sum, p) => sum + GRADE_SCALE[p.grade].score, 0) / picks.length;

        if (winRate >= 65 && avgGrade >= 3.0) {
          detected.push({
            type: 'positive',
            icon: '🏆',
            title: `${sport} Specialist`,
            detail: `${winRate.toFixed(0)}% win rate with ${avgGrade.toFixed(1)} GPA`
          });
        } else if (winRate <= 40) {
          detected.push({
            type: 'negative',
            icon: '📉',
            title: `${sport} Needs Work`,
            detail: `${winRate.toFixed(0)}% win rate. Study this sport more or reduce action.`
          });
        }
      }
    });

    // Analyze by tag
    const byTag = {};
    gradedPicks.forEach(pick => {
      (pick.tags || []).forEach(tag => {
        if (!byTag[tag]) byTag[tag] = [];
        byTag[tag].push(pick);
      });
    });

    Object.entries(byTag).forEach(([tag, picks]) => {
      if (picks.length >= 5) {
        const tagInfo = QUICK_TAGS.find(t => t.id === tag);
        const winRate = picks.filter(p => p.result === 'win').length / picks.length * 100;

        if (winRate >= 70) {
          detected.push({
            type: 'positive',
            icon: '✨',
            title: `${tagInfo?.label || tag} Working`,
            detail: `${winRate.toFixed(0)}% hit rate. Keep trusting this approach.`
          });
        } else if (winRate <= 35 && tag !== 'gut_feel') {
          detected.push({
            type: 'negative',
            icon: '🚫',
            title: `${tagInfo?.label || tag} Failing`,
            detail: `Only ${winRate.toFixed(0)}% hit rate. Reassess this strategy.`
          });
        }
      }
    });

    // Streak analysis
    let currentStreak = { type: null, count: 0 };
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let tempStreak = { type: null, count: 0 };

    [...gradedPicks].sort((a, b) => b.date - a.date).forEach(pick => {
      if (pick.result === tempStreak.type) {
        tempStreak.count++;
      } else {
        if (tempStreak.type === 'win' && tempStreak.count > maxWinStreak) maxWinStreak = tempStreak.count;
        if (tempStreak.type === 'loss' && tempStreak.count > maxLossStreak) maxLossStreak = tempStreak.count;
        tempStreak = { type: pick.result, count: 1 };
      }
    });

    if (maxLossStreak >= 5) {
      detected.push({
        type: 'warning',
        icon: '🔥',
        title: `${maxLossStreak}-Game Losing Streak Detected`,
        detail: `You've had a ${maxLossStreak}-game skid. Review unit sizing and consider reducing action after 3 straight losses.`
      });
    }

    if (maxWinStreak >= 6) {
      detected.push({
        type: 'positive',
        icon: '🔥',
        title: `${maxWinStreak}-Game Heater!`,
        detail: `You hit ${maxWinStreak} in a row. Don't get overconfident - stick to your process.`
      });
    }

    // Tilt detection
    const tiltPicks = gradedPicks.filter(p =>
      (p.categories || []).some(c => ['chased', 'oversized', 'fomo', 'live_tilt'].includes(c))
    );
    if (tiltPicks.length >= 3) {
      const tiltLossRate = tiltPicks.filter(p => p.result === 'loss').length / tiltPicks.length * 100;
      if (tiltLossRate >= 60) {
        detected.push({
          type: 'negative',
          icon: '😤',
          title: 'Tilt Detected',
          detail: `${tiltLossRate.toFixed(0)}% of emotional bets lost. Take breaks after losses.`
        });
      }
    }

    return detected;
  }, [gradedPicks]);

  if (!patterns || patterns.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>Analyzing Patterns...</h3>
        <p style={{ color: '#64748b', margin: 0 }}>
          {gradedPicks.length < 10
            ? `Grade ${10 - gradedPicks.length} more picks to see patterns`
            : 'No significant patterns detected yet'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🔍</span>
        Pattern Detection
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {patterns.map((pattern, idx) => (
          <div
            key={idx}
            style={{
              padding: 16,
              background: pattern.type === 'positive'
                ? 'rgba(34, 197, 94, 0.1)'
                : pattern.type === 'negative'
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(251, 191, 36, 0.1)',
              borderRadius: 12,
              borderLeft: `3px solid ${
                pattern.type === 'positive' ? '#22c55e'
                : pattern.type === 'negative' ? '#ef4444'
                : '#fbbf24'
              }`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{pattern.icon}</span>
              <span style={{
                fontWeight: 600,
                color: pattern.type === 'positive' ? '#4ade80'
                  : pattern.type === 'negative' ? '#f87171'
                  : '#fbbf24'
              }}>
                {pattern.title}
              </span>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 14, paddingLeft: 30 }}>
              {pattern.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// GRADED PICKS LIST
// ============================================================================

export const GradedPicksList = () => {
  const { gradedPicks, updateGrade, deleteGrade } = useGrading();
  const [editingPick, setEditingPick] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredPicks = useMemo(() => {
    let picks = [...gradedPicks];

    // Filter
    if (filter === 'wins') picks = picks.filter(p => p.result === 'win');
    else if (filter === 'losses') picks = picks.filter(p => p.result === 'loss');
    else if (filter === 'a-grade') picks = picks.filter(p => p.grade.startsWith('A'));
    else if (filter === 'poor') picks = picks.filter(p => ['D+', 'D', 'D-', 'F'].includes(p.grade));

    // Sort
    if (sortBy === 'date') picks.sort((a, b) => (b.gradedAt || b.date) - (a.gradedAt || a.date));
    else if (sortBy === 'grade') picks.sort((a, b) => GRADE_SCALE[b.grade].score - GRADE_SCALE[a.grade].score);

    return picks;
  }, [gradedPicks, filter, sortBy]);

  const handleSaveEdit = (gradeData) => {
    updateGrade(editingPick.id, gradeData);
    setEditingPick(null);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h3 style={{ color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>📚</span>
          Grading History ({gradedPicks.length})
        </h3>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 6,
              color: '#f1f5f9',
              fontSize: 13
            }}
          >
            <option value="all">All Picks</option>
            <option value="wins">Wins Only</option>
            <option value="losses">Losses Only</option>
            <option value="a-grade">A Grades</option>
            <option value="poor">Poor Grades</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 6,
              color: '#f1f5f9',
              fontSize: 13
            }}
          >
            <option value="date">By Date</option>
            <option value="grade">By Grade</option>
          </select>
        </div>
      </div>

      {filteredPicks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#64748b'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div>No graded picks match your filter</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredPicks.map(pick => (
            <div
              key={pick.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                background: 'rgba(51, 65, 85, 0.3)',
                borderRadius: 10,
                transition: 'all 0.2s'
              }}
            >
              {/* Grade Badge */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: GRADE_SCALE[pick.grade].bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: GRADE_SCALE[pick.grade].color,
                flexShrink: 0
              }}>
                {pick.grade}
              </div>

              {/* Pick Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  {pick.team} {pick.spread || pick.line}
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: pick.result === 'win' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: pick.result === 'win' ? '#4ade80' : '#f87171',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {pick.result === 'win' ? 'W' : 'L'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {pick.sport} • {new Date(pick.date).toLocaleDateString()} • {pick.odds > 0 ? '+' : ''}{pick.odds}
                </div>
                {pick.tags && pick.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {pick.tags.slice(0, 3).map(tagId => {
                      const tag = QUICK_TAGS.find(t => t.id === tagId);
                      return tag && (
                        <span
                          key={tagId}
                          style={{
                            padding: '2px 6px',
                            background: 'rgba(96, 165, 250, 0.15)',
                            borderRadius: 4,
                            fontSize: 10,
                            color: '#60a5fa'
                          }}
                        >
                          {tag.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setEditingPick(pick)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(96, 165, 250, 0.15)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#60a5fa',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this graded pick?')) {
                      deleteGrade(pick.id);
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#f87171',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPick && (
        <GradingModal
          pick={editingPick}
          onClose={() => setEditingPick(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

// ============================================================================
// DEMO DATA GENERATOR (for testing)
// ============================================================================

export const generateDemoData = () => {
  const sports = ['NFL', 'NBA', 'MLB', 'NHL'];
  const teams = {
    NFL: ['Chiefs', 'Eagles', 'Bills', '49ers', 'Cowboys', 'Dolphins'],
    NBA: ['Celtics', 'Lakers', 'Nuggets', 'Bucks', 'Heat', 'Suns'],
    MLB: ['Dodgers', 'Yankees', 'Braves', 'Astros', 'Phillies', 'Rangers'],
    NHL: ['Panthers', 'Oilers', 'Bruins', 'Stars', 'Avalanche', 'Rangers']
  };
  const grades = Object.keys(GRADE_SCALE);
  const allCategories = [];
  Object.values(GRADING_CATEGORIES).forEach(cat => {
    cat.options.forEach(opt => allCategories.push(opt.id));
  });

  const picks = [];
  for (let i = 0; i < 30; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const team = teams[sport][Math.floor(Math.random() * teams[sport].length)];
    const isWin = Math.random() > 0.45;
    const grade = grades[Math.floor(Math.random() * (isWin ? 7 : grades.length))];

    picks.push({
      id: `demo-${i}`,
      sport,
      team,
      opponent: teams[sport][Math.floor(Math.random() * teams[sport].length)],
      spread: Math.random() > 0.5 ? `${Math.random() > 0.5 ? '+' : '-'}${(Math.floor(Math.random() * 10) + 1)}.5` : null,
      line: Math.random() > 0.5 ? `o${Math.floor(Math.random() * 50) + 180}.5` : null,
      odds: Math.random() > 0.5 ? -110 : (Math.random() > 0.5 ? -115 : +100),
      units: Math.floor(Math.random() * 3) + 1,
      result: isWin ? 'win' : 'loss',
      date: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      grade,
      notes: '',
      tags: QUICK_TAGS.filter(() => Math.random() > 0.7).map(t => t.id).slice(0, 2),
      categories: allCategories.filter(() => Math.random() > 0.8).slice(0, 4),
      gradedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }

  return picks;
};

// ============================================================================
// MAIN GRADING DASHBOARD
// ============================================================================

export const GradingDashboard = () => {
  const { gradedPicks } = useGrading();
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    { id: 'insights', label: 'Insights', icon: '📊' },
    { id: 'weekly', label: 'Weekly Review', icon: '📅' },
    { id: 'patterns', label: 'Patterns', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📚' }
  ];

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
        .grading-tab:hover {
          background: rgba(96, 165, 250, 0.1) !important;
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
          🎓 Grading System
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Review, learn, and improve from every pick
        </p>
      </div>

      {/* Pending Grades Banner */}
      <PendingGradesBanner />

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        background: 'rgba(30, 41, 59, 0.5)',
        padding: 8,
        borderRadius: 12
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="grading-tab"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === tab.id ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
              border: 'none',
              borderRadius: 8,
              color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {activeTab === 'insights' && <GradingInsights />}
        {activeTab === 'weekly' && <WeeklyReview />}
        {activeTab === 'patterns' && <PatternDetector />}
        {activeTab === 'history' && <GradedPicksList />}
      </div>

      {/* Quick Stats Footer */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'center',
        gap: 32
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>
            {gradedPicks.length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Graded</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>
            {gradedPicks.filter(p => p.result === 'win').length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Wins</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f87171' }}>
            {gradedPicks.filter(p => p.result === 'loss').length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Losses</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>
            {gradedPicks.length > 0
              ? (gradedPicks.filter(p => p.result === 'win').length / gradedPicks.length * 100).toFixed(0) + '%'
              : '0%'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Win Rate</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  GRADE_SCALE,
  GRADING_CATEGORIES,
  QUICK_TAGS
};

export default GradingDashboard;
