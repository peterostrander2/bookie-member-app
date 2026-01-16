/**
 * TOOLTIP COMPONENT
 *
 * Reusable tooltip with help icon for explaining metrics.
 * Hover or tap to see explanation.
 */

import React, { useState } from 'react';

// Help icon that shows tooltip on hover/tap
export const HelpIcon = ({ tooltip, size = 14 }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); setShow(!show); }}
    >
      <span style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#333',
        color: '#9ca3af',
        fontSize: size - 4,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        marginLeft: '4px',
        fontWeight: 'bold',
        border: '1px solid #444'
      }}>
        ?
      </span>
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '10px 12px',
          backgroundColor: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          width: '220px',
          fontSize: '12px',
          lineHeight: 1.4,
          color: '#e5e7eb',
          whiteSpace: 'normal'
        }}>
          {tooltip}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #333'
          }} />
        </div>
      )}
    </span>
  );
};

// Metric explanations for consistent tooltips across the app
export const METRIC_TOOLTIPS = {
  aiScore: (
    <>
      <strong style={{ color: '#00D4FF' }}>AI Models Score (0-8)</strong>
      <br /><br />
      Combines 8 AI models: Ensemble, LSTM, Monte Carlo, XGBoost, Neural Net, Random Forest, Bayesian, and Gradient Boost.
      <br /><br />
      <span style={{ color: '#00FF88' }}>6+</span> = Strong agreement
      <br />
      <span style={{ color: '#FFD700' }}>4-6</span> = Moderate
      <br />
      <span style={{ color: '#9ca3af' }}>&lt;4</span> = Weak signal
    </>
  ),

  pillarsScore: (
    <>
      <strong style={{ color: '#FFD700' }}>8 Pillars Score (0-8)</strong>
      <br /><br />
      Evaluates 8 key factors: Sharp money %, Reverse line movement, Public fade opportunity, Situational spot, Rest advantage, Historical matchup, Weather/venue, and Injury impact.
      <br /><br />
      <span style={{ color: '#00FF88' }}>5+</span> = Many pillars align
      <br />
      <span style={{ color: '#FFD700' }}>3-5</span> = Some support
      <br />
      <span style={{ color: '#9ca3af' }}>&lt;3</span> = Limited backing
    </>
  ),

  totalScore: (
    <>
      <strong style={{ color: '#00FF88' }}>Total Score (0-20)</strong>
      <br /><br />
      Combined AI + Pillars + JARVIS bonus.
      <br /><br />
      <span style={{ color: '#00FF88' }}>10+</span> = SMASH play
      <br />
      <span style={{ color: '#00D4FF' }}>8-10</span> = Strong play
      <br />
      <span style={{ color: '#FFD700' }}>6-8</span> = Standard
      <br />
      <span style={{ color: '#9ca3af' }}>&lt;6</span> = Weak
    </>
  ),

  confidence: (
    <>
      <strong style={{ color: '#10B981' }}>Confidence %</strong>
      <br /><br />
      Overall conviction level based on all signals.
      <br /><br />
      <span style={{ color: '#00FF88' }}>85%+</span> = SMASH (max conviction)
      <br />
      <span style={{ color: '#00D4FF' }}>75-84%</span> = Strong play
      <br />
      <span style={{ color: '#FFD700' }}>65-74%</span> = Lean
      <br />
      <span style={{ color: '#9ca3af' }}>&lt;65%</span> = Watch only
    </>
  ),

  edge: (
    <>
      <strong style={{ color: '#00FF88' }}>Edge %</strong>
      <br /><br />
      Expected value vs. the betting line. Positive edge = +EV bet.
      <br /><br />
      Formula: (Your Prob - Implied Prob) / Implied Prob
      <br /><br />
      <span style={{ color: '#00FF88' }}>5%+</span> = Strong edge
      <br />
      <span style={{ color: '#FFD700' }}>2-5%</span> = Playable
      <br />
      <span style={{ color: '#9ca3af' }}>&lt;2%</span> = Marginal
    </>
  ),

  sharpMoney: (
    <>
      <strong style={{ color: '#00D4FF' }}>Sharp Money %</strong>
      <br /><br />
      Percentage of total dollars (not tickets) on this side. Sharp bettors place larger wagers.
      <br /><br />
      <span style={{ color: '#00FF88' }}>65%+</span> = Heavy sharp action
      <br />
      <span style={{ color: '#FFD700' }}>55-65%</span> = Moderate sharp lean
      <br /><br />
      Key: When money % diverges from ticket %, sharps are on the money side.
    </>
  ),

  jarvis: (
    <>
      <strong style={{ color: '#8B5CF6' }}>JARVIS Triggers (0-4)</strong>
      <br /><br />
      Esoteric numerology signals based on gematria patterns:
      <br /><br />
      <span style={{ color: '#FFD700' }}>2178</span> = "Immortal" trigger
      <br />
      <span style={{ color: '#8B5CF6' }}>33, 93, 322</span> = Power numbers
      <br /><br />
      Bonus points when team names or dates hit these patterns.
    </>
  ),

  clv: (
    <>
      <strong style={{ color: '#00D4FF' }}>CLV (Closing Line Value)</strong>
      <br /><br />
      Measures if you beat the closing line. Consistently beating closing lines = long-term profit.
      <br /><br />
      <span style={{ color: '#00FF88' }}>Positive CLV</span> = Got better odds than close
      <br />
      <span style={{ color: '#FF4444' }}>Negative CLV</span> = Worse odds than close
    </>
  ),

  kelly: (
    <>
      <strong style={{ color: '#10B981' }}>Kelly Criterion</strong>
      <br /><br />
      Optimal bet sizing based on edge and odds.
      <br /><br />
      Formula: (bp - q) / b
      <br />
      where b = odds, p = win prob, q = lose prob
      <br /><br />
      We use <span style={{ color: '#FFD700' }}>Quarter Kelly</span> (25%) for safety.
    </>
  ),

  rlm: (
    <>
      <strong style={{ color: '#FFD700' }}>RLM (Reverse Line Movement)</strong>
      <br /><br />
      When the line moves AGAINST the public betting majority. Strong indicator of sharp action.
      <br /><br />
      Example: 70% of tickets on Team A, but line moves toward Team B = sharps on B.
    </>
  )
};

// Convenience component for common metrics
export const AIScoreHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.aiScore} />;
export const PillarsScoreHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.pillarsScore} />;
export const TotalScoreHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.totalScore} />;
export const ConfidenceHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.confidence} />;
export const EdgeHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.edge} />;
export const SharpMoneyHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.sharpMoney} />;
export const JarvisHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.jarvis} />;
export const CLVHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.clv} />;
export const KellyHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.kelly} />;
export const RLMHelp = () => <HelpIcon tooltip={METRIC_TOOLTIPS.rlm} />;

export default HelpIcon;
