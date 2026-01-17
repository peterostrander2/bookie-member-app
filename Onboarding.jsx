import React, { useState, useEffect, useRef } from 'react';

const ONBOARDING_KEY = 'bookie_onboarding_complete';
const PREFERENCES_KEY = 'bookie_user_preferences'; // Must match usePreferences.js

// Check if onboarding is complete
export const isOnboardingComplete = () => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
};

// Mark onboarding as complete
export const completeOnboarding = () => {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Ignore
  }
};

// Reset onboarding (for testing)
export const resetOnboarding = () => {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Ignore
  }
};

// Save to the main preferences system used by usePreferences hook
const saveToPreferencesSystem = (sportsList, experienceLevel) => {
  try {
    // Get existing preferences or use defaults
    const existingPrefs = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');

    // Update with onboarding selections - use first selected sport as favorite
    const updatedPrefs = {
      ...existingPrefs,
      favoriteSport: sportsList[0] || 'NBA', // Primary sport
      favoriteSports: sportsList, // All selected sports
      experienceLevel: experienceLevel,
      onboardingComplete: true,
      defaultTab: 'props' // Default to props tab
    };

    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));
    return true;
  } catch {
    return false;
  }
};

const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    sports: ['NBA'], // Default to NBA
    experienceLevel: 'intermediate',
    bettingStyle: 'balanced' // Add betting style preference
  });

  // Accessibility: refs for focus management
  const titleRef = useRef(null);
  const continueButtonRef = useRef(null);

  // Accessibility: Focus title when step changes for screen reader announcement
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  // Accessibility: Handle Escape key to skip onboarding
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Skip onboarding on Escape
        completeOnboarding();
        saveToPreferencesSystem(preferences.sports, preferences.experienceLevel);
        onComplete?.(preferences);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, preferences]);

  const sports = [
    { id: 'NBA', name: 'NBA', icon: '🏀' },
    { id: 'NFL', name: 'NFL', icon: '🏈' },
    { id: 'MLB', name: 'MLB', icon: '⚾' },
    { id: 'NHL', name: 'NHL', icon: '🏒' },
    { id: 'NCAAB', name: 'NCAAB', icon: '🏀' }
  ];

  const toggleSport = (sportId) => {
    setPreferences(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(s => s !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const handleComplete = () => {
    // Save preferences to the main preferences system
    saveToPreferencesSystem(preferences.sports, preferences.experienceLevel);
    completeOnboarding();
    onComplete?.(preferences); // Pass preferences to callback
  };

  const handleSkip = () => {
    // Save default preferences
    saveToPreferencesSystem(['NBA'], 'intermediate');
    completeOnboarding();
    onComplete?.({ sports: ['NBA'], experienceLevel: 'intermediate' });
  };

  // 3-step flow with signal explanations
  const steps = [
    // Step 0: Welcome + Sport Selection
    {
      title: 'Welcome to Bookie-o-em',
      content: (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎰</div>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', maxWidth: '380px', margin: '0 auto' }}>
              AI-powered betting signals with 8 ML models, 8 analytical pillars, and esoteric analysis.
            </p>
          </div>

          {/* Key stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '25px',
            padding: '15px',
            backgroundColor: '#1a1a2e',
            borderRadius: '10px'
          }}>
            {[
              { value: '8', label: 'AI Models' },
              { value: '8', label: 'Pillars' },
              { value: '10+', label: 'Books' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00D4FF', fontSize: '22px', fontWeight: 'bold' }}>{stat.value}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Sport selection */}
          <div>
            <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
              Select your sports (pick at least one)
            </div>
            <div role="group" aria-label="Select sports" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
                  aria-pressed={preferences.sports.includes(sport.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: preferences.sports.includes(sport.id) ? '#10B98120' : '#1a1a2e',
                    border: preferences.sports.includes(sport.id) ? '2px solid #10B981' : '2px solid #333',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{sport.icon}</span>
                  <span style={{ color: preferences.sports.includes(sport.id) ? '#10B981' : '#9ca3af', fontWeight: '500', fontSize: '14px' }}>
                    {sport.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // Step 1: Understanding the Signals
    {
      title: 'Understanding Our Signals',
      content: (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
            Every pick shows these key metrics
          </p>

          {/* Signal explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* AI Score */}
            <div style={{
              padding: '12px',
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  backgroundColor: 'rgba(0, 212, 255, 0.2)',
                  color: '#00D4FF',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>6.5</div>
                <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>AI Score (0-8)</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Combines 8 ML models: Ensemble, LSTM, Monte Carlo, XGBoost, Neural Net, Random Forest, Bayesian, and Regression.
                <span style={{ color: '#10B981' }}> 6+</span> = strong agreement.
              </p>
            </div>

            {/* Pillars Score */}
            <div style={{
              padding: '12px',
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#F59E0B',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>5.2</div>
                <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>Pillars Score (0-8)</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Evaluates sharp money, reverse line movement, matchup history, recent form, rest advantage, home/away, injuries, and pace.
                <span style={{ color: '#10B981' }}> 5+</span> = many pillars align.
              </p>
            </div>

            {/* Confidence Tiers */}
            <div style={{
              padding: '12px',
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ color: '#fff', fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}>
                Confidence Tiers
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  SMASH 85%+
                </span>
                <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  STRONG 75-84%
                </span>
                <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  LEAN 65-74%
                </span>
                <span style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#6B7280', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  WATCH &lt;65%
                </span>
              </div>
            </div>

            {/* Edge */}
            <div style={{
              padding: '12px',
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>+4.2%</div>
                <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>Edge %</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Expected value vs. the betting line.
                <span style={{ color: '#10B981' }}> Positive edge = +EV bet.</span> Focus on 3%+ edge for best results.
              </p>
            </div>
          </div>
        </div>
      )
    },
    // Step 2: Quick Tips + Get Started
    {
      title: "You're Ready!",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            Here's how to get the most from Bookie-o-em
          </p>

          {/* Quick tips grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: '🔥', title: 'AI Picks', tip: '85%+ confidence = best edge' },
              { icon: '💵', title: 'Sharp Money', tip: 'Follow where pros bet' },
              { icon: '🎯', title: 'Best Odds', tip: 'Compare 10+ books instantly' },
              { icon: '📊', title: 'Track Results', tip: 'Grade picks for CLV' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #333',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{item.title}</span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>{item.tip}</div>
              </div>
            ))}
          </div>

          {/* Pro tip */}
          <div style={{
            backgroundColor: '#00FF8815',
            border: '1px solid #00FF8840',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'left'
          }}>
            <div style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
              Pro Tip
            </div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
              Start with AI Picks to see today's top predictions. Focus on 80%+ confidence.
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (step === 0) return preferences.sports.length > 0;
    return true;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-step-indicator"
        style={{
          backgroundColor: '#0a0a0f',
          borderRadius: '16px',
          border: '1px solid #333',
          maxWidth: '440px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Progress Bar - 2 steps */}
        <div style={{ padding: '16px 20px 0' }}>
          <div
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label={`Step ${step + 1} of ${steps.length}`}
            style={{ display: 'flex', gap: '8px' }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: i <= step ? '#00D4FF' : '#333',
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
          </div>
          <div id="onboarding-step-indicator" style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          <h1
            id="onboarding-title"
            ref={titleRef}
            tabIndex={-1}
            style={{
              color: '#00D4FF',
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '20px',
              outline: 'none'
            }}
          >
            {steps[step].title}
          </h1>
          {steps[step].content}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderTop: '1px solid #333'
        }}>
          {step === 0 ? (
            <button
              onClick={handleSkip}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Skip
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{
                padding: '10px 24px',
                backgroundColor: canProceed() ? '#10B981' : '#333',
                color: canProceed() ? '#fff' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              style={{
                padding: '10px 24px',
                backgroundColor: '#10B981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
