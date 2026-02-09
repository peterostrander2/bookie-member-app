import React, { memo } from 'react';

/**
 * ReasonPanel - Expandable panel showing categorized pick reasons
 *
 * Displays reason arrays from backend v20.12:
 * - AI Reasons: Model predictions and consensus signals
 * - Esoteric Reasons: Numerology, gematria, cosmic alignment
 * - Context Reasons: Stadium altitude, travel fatigue, officials
 *
 * Also displays v20.12-specific signals:
 * - Stadium/altitude impact (Denver +0.3, Utah +0.2)
 * - Travel fatigue (B2B, cross-country trips)
 * - Officials fallback (when ESPN hasn't assigned refs yet)
 */

// Category configuration with styling
const REASON_CATEGORIES = {
  ai: {
    label: 'AI Analysis',
    icon: '🤖',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  esoteric: {
    label: 'Esoteric Signals',
    icon: '⚡',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  context: {
    label: 'Context Factors',
    icon: '📊',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
};

// Styles
const panelStyle = {
  marginTop: '8px',
};

const summaryStyle = {
  color: '#A855F7',
  fontSize: '11px',
  cursor: 'pointer',
  padding: '4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const contentStyle = {
  backgroundColor: '#0a0a14',
  borderRadius: '8px',
  padding: '12px',
  marginTop: '4px',
};

const categoryContainerStyle = {
  marginBottom: '12px',
};

const categoryHeaderStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '8px',
  color,
  fontSize: '11px',
  fontWeight: 'bold',
});

const reasonItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  marginBottom: '6px',
};

const bulletStyle = (color) => ({
  color,
  fontSize: '10px',
  marginTop: '2px',
});

const textStyle = {
  color: '#fff',
  fontSize: '12px',
  lineHeight: '1.4',
};

// V20.12 Feature Badges
const FeatureBadge = ({ label, value, color, icon }) => {
  if (!value) return null;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      borderRadius: '4px',
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`,
      marginRight: '6px',
      marginBottom: '4px',
    }}>
      <span style={{ fontSize: '10px' }}>{icon}</span>
      <span style={{ color, fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
      <span style={{ color: '#fff', fontSize: '10px' }}>
        {typeof value === 'number' ? (value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)) : value}
      </span>
    </div>
  );
};

// Single reason item
const ReasonItem = ({ reason, color }) => (
  <div style={reasonItemStyle}>
    <span style={bulletStyle(color)}>▸</span>
    <span style={textStyle}>{reason}</span>
  </div>
);

// Category section
const CategorySection = ({ category, reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  const config = REASON_CATEGORIES[category];
  if (!config) return null;

  return (
    <div style={categoryContainerStyle}>
      <div style={categoryHeaderStyle(config.color)}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
        <span style={{ color: '#6B7280', fontWeight: 'normal' }}>({reasons.length})</span>
      </div>
      <div style={{
        backgroundColor: config.bgColor,
        borderRadius: '6px',
        padding: '10px',
        border: `1px solid ${config.borderColor}`,
      }}>
        {reasons.map((reason, idx) => (
          <ReasonItem key={idx} reason={reason} color={config.color} />
        ))}
      </div>
    </div>
  );
};

// V20.12 Feature Section
const FeatureSection = ({ pick }) => {
  const hasStadium = pick.scoring_impact !== 0 || pick.altitude_impact;
  const hasTravel = pick.travel_fatigue !== 0 || pick.away_fatigue !== 0 || pick.home_boost !== 0;
  const hasOfficials = pick.officials_fallback || pick.officials_data;

  if (!hasStadium && !hasTravel && !hasOfficials) return null;

  return (
    <div style={{
      marginBottom: '12px',
      padding: '10px',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(139, 92, 246, 0.2)',
    }}>
      <div style={{
        color: '#8B5CF6',
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>🎯</span>
        <span>v20.12 Features Active</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* Stadium/Altitude */}
        {hasStadium && (
          <FeatureBadge
            label="Altitude"
            value={pick.scoring_impact}
            color="#F59E0B"
            icon="🏔️"
          />
        )}
        {/* Travel Fatigue */}
        {pick.away_fatigue !== 0 && (
          <FeatureBadge
            label="Away Fatigue"
            value={pick.away_fatigue}
            color="#EF4444"
            icon="✈️"
          />
        )}
        {pick.home_boost !== 0 && (
          <FeatureBadge
            label="Home Boost"
            value={pick.home_boost}
            color="#10B981"
            icon="🏠"
          />
        )}
        {/* Officials */}
        {pick.officials_fallback && (
          <FeatureBadge
            label="Officials"
            value="Fallback"
            color="#6B7280"
            icon="👨‍⚖️"
          />
        )}
        {pick.officials_data?.lead_official && (
          <FeatureBadge
            label="Lead Ref"
            value={pick.officials_data.lead_official}
            color="#3B82F6"
            icon="👨‍⚖️"
          />
        )}
      </div>
      {/* Travel details */}
      {pick.travel_data && (
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#9CA3AF' }}>
          {pick.travel_data.distance_miles && (
            <span>Distance: {pick.travel_data.distance_miles.toLocaleString()} miles</span>
          )}
          {pick.travel_data.rest_days !== undefined && (
            <span style={{ marginLeft: '12px' }}>Rest days: {pick.travel_data.rest_days}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
const ReasonPanel = memo(({ pick }) => {
  if (!pick) return null;

  // Check if we have any reasons to display
  const aiReasons = pick.ai_reasons || [];
  const esotericReasons = pick.esoteric_reasons || [];
  const contextReasons = pick.context_reasons || [];
  const genericReasons = pick.reasons || [];

  const totalReasons = aiReasons.length + esotericReasons.length + contextReasons.length;
  const hasV20Features = pick.scoring_impact !== 0 ||
                         pick.away_fatigue !== 0 ||
                         pick.home_boost !== 0 ||
                         pick.officials_fallback;

  // Don't render if no reasons or features
  if (totalReasons === 0 && genericReasons.length === 0 && !hasV20Features) {
    return null;
  }

  return (
    <details style={panelStyle}>
      <summary style={summaryStyle}>
        <span>🎯</span>
        <span>Why This Pick</span>
        {totalReasons > 0 && (
          <span style={{ color: '#6B7280', fontSize: '10px' }}>
            ({totalReasons} reason{totalReasons !== 1 ? 's' : ''})
          </span>
        )}
      </summary>
      <div style={contentStyle}>
        {/* V20.12 Feature badges */}
        <FeatureSection pick={pick} />

        {/* Categorized reasons */}
        <CategorySection category="ai" reasons={aiReasons} />
        <CategorySection category="esoteric" reasons={esotericReasons} />
        <CategorySection category="context" reasons={contextReasons} />

        {/* Generic reasons (fallback for older API format) */}
        {genericReasons.length > 0 && totalReasons === 0 && (
          <div style={categoryContainerStyle}>
            <div style={categoryHeaderStyle('#8B5CF6')}>
              <span>📋</span>
              <span>Analysis</span>
            </div>
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '6px',
              padding: '10px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
              {genericReasons.map((reason, idx) => {
                // Parse reason to determine category color
                const isResearch = reason.includes('RESEARCH:');
                const isEsoteric = reason.includes('ESOTERIC:');
                const isConfluence = reason.includes('CONFLUENCE:');
                const color = isEsoteric ? '#FFD700' : isConfluence ? '#10B981' : '#3B82F6';
                return <ReasonItem key={idx} reason={reason} color={color} />;
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalReasons === 0 && genericReasons.length === 0 && hasV20Features && (
          <div style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center', padding: '8px' }}>
            Reason details will appear when available
          </div>
        )}
      </div>
    </details>
  );
});

ReasonPanel.displayName = 'ReasonPanel';

export default ReasonPanel;
