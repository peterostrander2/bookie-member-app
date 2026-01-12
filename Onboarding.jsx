import React, { useState, useEffect } from 'react';

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
    sports: [],
    experienceLevel: '',
    riskTolerance: 'moderate'
  });

  const sports = [
    { id: 'NBA', name: 'NBA Basketball', icon: '🏀' },
    { id: 'NFL', name: 'NFL Football', icon: '🏈' },
    { id: 'MLB', name: 'MLB Baseball', icon: '⚾' },
    { id: 'NHL', name: 'NHL Hockey', icon: '🏒' },
    { id: 'NCAAB', name: 'College Basketball', icon: '🎓' }
  ];

  const experienceLevels = [
    { id: 'beginner', name: 'Beginner', desc: 'New to sports betting' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Some betting experience' },
    { id: 'advanced', name: 'Advanced', desc: 'Experienced bettor' },
    { id: 'pro', name: 'Professional', desc: 'Full-time bettor' }
  ];

  const features = [
    { icon: '🔥', title: 'Smash Spots', desc: 'AI-powered picks with 8 ML models and 8 analytical pillars' },
    { icon: '💵', title: 'Sharp Money', desc: 'Follow where the smart money is moving' },
    { icon: '🎯', title: 'Best Odds', desc: 'Find the best lines across 10+ sportsbooks' },
    { icon: '📊', title: 'CLV Tracking', desc: 'Track your closing line value performance' },
    { icon: '🔮', title: 'Esoteric Edge', desc: 'Unique numerology and gematria signals' },
    { icon: '💰', title: 'Bankroll Manager', desc: 'Kelly Criterion bet sizing and risk analysis' }
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

  const steps = [
    // Step 0: Welcome
    {
      title: 'Welcome to Bookie-o-em',
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎰</div>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>
            AI-Powered Betting Signals
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
            Gain an edge with our ensemble of 8 machine learning models,
            8 analytical pillars, and unique esoteric signals.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '8', label: 'ML Models' },
              { value: '8', label: 'Pillars' },
              { value: '10+', label: 'Sportsbooks' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00D4FF', fontSize: '28px', fontWeight: 'bold' }}>{stat.value}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Step 1: Select Sports
    {
      title: 'Select Your Sports',
      content: (
        <div>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '25px' }}>
            Choose the sports you want to bet on. You can change this later.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => toggleSport(sport.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px 20px',
                  backgroundColor: preferences.sports.includes(sport.id) ? '#00D4FF20' : '#1a1a2e',
                  border: preferences.sports.includes(sport.id) ? '2px solid #00D4FF' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '28px' }}>{sport.icon}</span>
                <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{sport.name}</span>
                {preferences.sports.includes(sport.id) && (
                  <span style={{ marginLeft: 'auto', color: '#00D4FF', fontSize: '20px' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )
    },
    // Step 2: Experience Level
    {
      title: 'Your Experience Level',
      content: (
        <div>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '25px' }}>
            Help us tailor the experience to your needs.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {experienceLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setPreferences(prev => ({ ...prev, experienceLevel: level.id }))}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '15px 20px',
                  backgroundColor: preferences.experienceLevel === level.id ? '#00D4FF20' : '#1a1a2e',
                  border: preferences.experienceLevel === level.id ? '2px solid #00D4FF' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{level.name}</span>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>{level.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    // Step 3: Feature Tour
    {
      title: 'Key Features',
      content: (
        <div>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '25px' }}>
            Here's what you'll find in Bookie-o-em.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '15px',
                  backgroundColor: '#1a1a2e',
                  borderRadius: '10px',
                  border: '1px solid #333'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feature.icon}</div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  {feature.title}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Step 4: Ready
    {
      title: "You're All Set!",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '15px' }}>
            Ready to Beat the Books
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto 25px' }}>
            Head to <strong style={{ color: '#00D4FF' }}>Smash Spots</strong> to see today's
            AI-powered picks with confidence scores.
          </p>
          <div style={{
            backgroundColor: '#00FF8815',
            border: '1px solid #00FF8840',
            borderRadius: '10px',
            padding: '15px',
            maxWidth: '350px',
            margin: '0 auto'
          }}>
            <div style={{ color: '#00FF88', fontWeight: 'bold', marginBottom: '5px' }}>
              Pro Tip
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>
              Focus on 80%+ confidence picks for the best edge.
              Track your picks to measure your CLV performance.
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (step === 1) return preferences.sports.length > 0;
    if (step === 2) return preferences.experienceLevel !== '';
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
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Progress Bar */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
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
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          <h1 style={{
            color: '#00D4FF',
            fontSize: '20px',
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            {steps[step].title}
          </h1>
          {steps[step].content}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px',
          borderTop: '1px solid #333'
        }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleComplete}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Skip Tour
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{
                padding: '12px 24px',
                backgroundColor: canProceed() ? '#00D4FF' : '#333',
                color: canProceed() ? '#000' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00FF88',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
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
