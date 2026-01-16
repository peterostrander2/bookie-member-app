import React, { useState } from 'react';

const ONBOARDING_KEY = 'bookie_onboarding_complete';

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

const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    sports: ['NBA'], // Default to NBA
    experienceLevel: 'intermediate'
  });

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
    // Save preferences
    try {
      localStorage.setItem('bookie_preferences', JSON.stringify(preferences));
    } catch {
      // Ignore
    }
    completeOnboarding();
    onComplete?.();
  };

  const handleSkip = () => {
    // Save default preferences
    try {
      localStorage.setItem('bookie_preferences', JSON.stringify({ sports: ['NBA'], experienceLevel: 'intermediate' }));
    } catch {
      // Ignore
    }
    completeOnboarding();
    onComplete?.();
  };

  // Streamlined 2-step flow
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
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
    // Step 1: Quick Tips + Get Started
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
              { icon: '🔥', title: 'Smash Spots', tip: '85%+ confidence = best edge' },
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
              Start with Smash Spots to see today's top AI picks. Focus on 80%+ confidence.
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
      <div style={{
        backgroundColor: '#0a0a0f',
        borderRadius: '16px',
        border: '1px solid #333',
        maxWidth: '440px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Progress Bar - 2 steps */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
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
          <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          <h1 style={{
            color: '#00D4FF',
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
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
              onClick={() => setStep(0)}
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
