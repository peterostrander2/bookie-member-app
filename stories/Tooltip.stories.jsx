import React from 'react';
import {
  HelpIcon,
  AIScoreHelp,
  PillarsScoreHelp,
  ConfidenceHelp,
  EdgeHelp,
  SharpMoneyHelp,
  JarvisHelp,
  CLVHelp,
  KellyHelp,
  RLMHelp,
} from '../Tooltip';

export default {
  title: 'Components/Tooltip',
  component: HelpIcon,
  tags: ['autodocs'],
  argTypes: {
    tooltip: {
      control: 'text',
      description: 'Content to display in the tooltip',
    },
    size: {
      control: { type: 'number', min: 10, max: 24 },
      description: 'Size of the help icon in pixels',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Help icon with tooltip for explaining metrics. Shows on hover or tap.',
      },
    },
  },
};

export const Default = {
  args: {
    tooltip: 'This is a helpful explanation that appears on hover.',
    size: 14,
  },
  render: (args) => (
    <div style={{ padding: '60px 20px' }}>
      <span style={{ color: '#fff' }}>
        Hover over the icon
        <HelpIcon {...args} />
      </span>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ padding: '60px 20px', display: 'flex', gap: '24px', alignItems: 'center' }}>
      <span style={{ color: '#fff' }}>
        Small (12px)
        <HelpIcon tooltip="Small tooltip" size={12} />
      </span>
      <span style={{ color: '#fff' }}>
        Default (14px)
        <HelpIcon tooltip="Default size tooltip" size={14} />
      </span>
      <span style={{ color: '#fff' }}>
        Large (18px)
        <HelpIcon tooltip="Large tooltip" size={18} />
      </span>
    </div>
  ),
};

export const RichContent = {
  render: () => (
    <div style={{ padding: '80px 20px' }}>
      <span style={{ color: '#fff' }}>
        Rich tooltip content
        <HelpIcon
          tooltip={
            <>
              <strong style={{ color: '#00FF88' }}>Formatted Content</strong>
              <br /><br />
              Tooltips support JSX for rich formatting:
              <br />
              • <span style={{ color: '#00D4FF' }}>Colored text</span>
              <br />
              • <strong>Bold text</strong>
              <br />
              • Lists and structure
            </>
          }
        />
      </span>
    </div>
  ),
};

// Pre-built metric tooltips
export const MetricTooltips = {
  render: () => (
    <div style={{ padding: '100px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>AI Score</span>
        <AIScoreHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>8 Pillars</span>
        <PillarsScoreHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>Confidence</span>
        <ConfidenceHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>Edge %</span>
        <EdgeHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>Sharp Money</span>
        <SharpMoneyHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>JARVIS</span>
        <JarvisHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>CLV</span>
        <CLVHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>Kelly</span>
        <KellyHelp />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <span style={{ width: '120px' }}>RLM</span>
        <RLMHelp />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Pre-built help icons for common betting metrics. Hover each to see explanation.' },
    },
  },
};

// Inline usage example
export const InlineUsage = {
  render: () => (
    <div style={{ padding: '80px 20px' }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '16px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: '#9ca3af' }}>
            Confidence
            <ConfidenceHelp />
          </span>
          <span style={{ color: '#00FF88', fontWeight: 'bold' }}>87%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: '#9ca3af' }}>
            Edge
            <EdgeHelp />
          </span>
          <span style={{ color: '#00D4FF' }}>+4.2%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af' }}>
            Sharp Money
            <SharpMoneyHelp />
          </span>
          <span>68%</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Example of help icons used inline with metrics in a card.' },
    },
  },
};
