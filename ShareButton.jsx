/**
 * SHARE BUTTON COMPONENT
 *
 * Enables sharing picks and parlays to Twitter/X, Discord, or clipboard.
 * Uses Web Share API on mobile for native sharing experience.
 */

import React, { useState } from 'react';
import { FeatureEvents } from './analytics';

// Format a single pick for sharing
export function formatPickForShare(pick) {
  const confidence = pick.confidence >= 85 ? 'SMASH' :
                     pick.confidence >= 75 ? 'STRONG' :
                     pick.confidence >= 65 ? 'LEAN' : 'WATCH';

  const odds = pick.odds > 0 ? `+${pick.odds}` : pick.odds;

  let text = '';
  if (pick.player) {
    // Player prop
    text = `${pick.player} ${pick.side} ${pick.line} ${pick.stat_type}\n`;
    text += `${odds} | ${confidence} (${pick.confidence}%)\n`;
  } else {
    // Game pick
    text = `${pick.team || pick.selection} ${pick.bet_type}\n`;
    if (pick.spread) text += `Spread: ${pick.spread}\n`;
    text += `${odds} | ${confidence} (${pick.confidence}%)\n`;
  }

  return text;
}

// Format parlay for sharing
export function formatParlayForShare(legs, combinedOdds, stake = null) {
  let text = `PARLAY (${legs.length} legs)\n`;
  text += '━━━━━━━━━━━━━━━━━\n';

  legs.forEach((leg, i) => {
    const odds = leg.odds > 0 ? `+${leg.odds}` : leg.odds;
    if (leg.player) {
      text += `${i + 1}. ${leg.player} ${leg.side} ${leg.line} (${odds})\n`;
    } else {
      text += `${i + 1}. ${leg.team || leg.selection} (${odds})\n`;
    }
  });

  text += '━━━━━━━━━━━━━━━━━\n';
  const oddsStr = combinedOdds > 0 ? `+${combinedOdds}` : combinedOdds;
  text += `Combined: ${oddsStr}`;

  if (stake) {
    const payout = calculatePayout(combinedOdds, stake);
    text += ` | $${stake} → $${payout.toFixed(2)}`;
  }

  return text;
}

// Calculate potential payout
function calculatePayout(odds, stake) {
  if (odds > 0) {
    return stake + (stake * odds / 100);
  } else {
    return stake + (stake * 100 / Math.abs(odds));
  }
}

// Get share URLs
function getTwitterUrl(text) {
  const encoded = encodeURIComponent(text + '\n\nvia @BookieOEM');
  return `https://twitter.com/intent/tweet?text=${encoded}`;
}

function getDiscordText(text) {
  return '```\n' + text + '\n```';
}

// ShareButton component
export const ShareButton = ({
  pick = null,
  parlay = null,
  combinedOdds = null,
  stake = null,
  size = 'medium',
  style = {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate share text
  const getText = () => {
    if (parlay && parlay.length > 0) {
      return formatParlayForShare(parlay, combinedOdds, stake);
    }
    if (pick) {
      return formatPickForShare(pick);
    }
    return '';
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    const text = getText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bookie-o-em Pick',
          text: text,
        });
        FeatureEvents.trackEvent?.('share', { method: 'native', type: parlay ? 'parlay' : 'pick' });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    setShowMenu(false);
  };

  // Handle Twitter share
  const handleTwitterShare = () => {
    const text = getText();
    const url = getTwitterUrl(text);
    window.open(url, '_blank', 'width=550,height=420');
    FeatureEvents.trackEvent?.('share', { method: 'twitter', type: parlay ? 'parlay' : 'pick' });
    setShowMenu(false);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      FeatureEvents.trackEvent?.('share', { method: 'clipboard', type: parlay ? 'parlay' : 'pick' });
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setShowMenu(false);
  };

  // Handle Discord copy (with code block formatting)
  const handleDiscordCopy = async () => {
    const text = getDiscordText(getText());
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      FeatureEvents.trackEvent?.('share', { method: 'discord', type: parlay ? 'parlay' : 'pick' });
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setShowMenu(false);
  };

  const buttonSize = size === 'small' ? '32px' : size === 'large' ? '48px' : '40px';
  const iconSize = size === 'small' ? '14px' : size === 'large' ? '20px' : '16px';

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: '1px solid #333',
          backgroundColor: showMenu ? '#00D4FF20' : '#1a1a2e',
          color: showMenu ? '#00D4FF' : '#9ca3af',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title="Share"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '160px',
              zIndex: 999,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Native share (mobile only) */}
            {navigator.share && (
              <ShareMenuItem
                icon="📤"
                label="Share..."
                onClick={handleNativeShare}
              />
            )}

            <ShareMenuItem
              icon="𝕏"
              label="Post to X"
              onClick={handleTwitterShare}
            />

            <ShareMenuItem
              icon="💬"
              label="Copy for Discord"
              onClick={handleDiscordCopy}
            />

            <ShareMenuItem
              icon={copied ? '✓' : '📋'}
              label={copied ? 'Copied!' : 'Copy to Clipboard'}
              onClick={handleCopy}
              highlight={copied}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Menu item component
const ShareMenuItem = ({ icon, label, onClick, highlight = false }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      padding: '10px 12px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: highlight ? '#00FF88' : '#fff',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background-color 0.2s',
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = '#00D4FF15'}
    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
  >
    <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{icon}</span>
    <span>{label}</span>
  </button>
);

// Quick share to Twitter (no menu)
export const QuickShareTwitter = ({ pick, parlay, combinedOdds, stake, style = {} }) => {
  const handleClick = () => {
    let text = '';
    if (parlay && parlay.length > 0) {
      text = formatParlayForShare(parlay, combinedOdds, stake);
    } else if (pick) {
      text = formatPickForShare(pick);
    }
    const url = getTwitterUrl(text);
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        backgroundColor: '#1DA1F2',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        ...style,
      }}
    >
      <span>𝕏</span>
      Share
    </button>
  );
};

export default ShareButton;
