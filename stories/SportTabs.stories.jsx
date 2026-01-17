import React, { useState } from 'react';
import SportTabs, { SportTabsCompact, SportDropdown } from '../SportTabs';

export default {
  title: 'Components/SportTabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Sport selector with three variants: full tabs, compact icons, and dropdown for mobile.',
      },
    },
  },
};

// Interactive wrapper for stories
const InteractiveTabs = ({ Component, ...props }) => {
  const [selected, setSelected] = useState('NBA');
  return (
    <div>
      <Component selected={selected} onChange={setSelected} {...props} />
      <p style={{ color: '#9ca3af', marginTop: '12px', fontSize: '12px' }}>
        Selected: <span style={{ color: '#00D4FF' }}>{selected}</span>
      </p>
    </div>
  );
};

// Full tabs
export const Default = {
  render: () => <InteractiveTabs Component={SportTabs} />,
  parameters: {
    docs: {
      description: { story: 'Default sport tabs with icon and name.' },
    },
  },
};

export const WithAllSports = {
  render: () => <InteractiveTabs Component={SportTabs} showAll />,
  parameters: {
    docs: {
      description: { story: 'Tabs with "All Sports" option prepended.' },
    },
  },
};

export const NBASelected = {
  render: () => <SportTabs selected="NBA" onChange={() => {}} />,
};

export const NFLSelected = {
  render: () => <SportTabs selected="NFL" onChange={() => {}} />,
};

export const MLBSelected = {
  render: () => <SportTabs selected="MLB" onChange={() => {}} />,
};

// Compact variant
export const Compact = {
  render: () => <InteractiveTabs Component={SportTabsCompact} />,
  parameters: {
    docs: {
      description: { story: 'Compact icon-only tabs for tight spaces.' },
    },
  },
};

export const CompactNBASelected = {
  render: () => <SportTabsCompact selected="NBA" onChange={() => {}} />,
};

// Dropdown variant
export const Dropdown = {
  render: () => <InteractiveTabs Component={SportDropdown} />,
  parameters: {
    docs: {
      description: { story: 'Dropdown selector for mobile or minimal UI.' },
    },
  },
};

export const DropdownNFLSelected = {
  render: () => <SportDropdown selected="NFL" onChange={() => {}} />,
};

// All variants comparison
export const AllVariants = {
  render: () => {
    const [selected, setSelected] = useState('NBA');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section>
          <h3 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '14px' }}>Full Tabs</h3>
          <SportTabs selected={selected} onChange={setSelected} />
        </section>

        <section>
          <h3 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '14px' }}>With All Sports Option</h3>
          <SportTabs selected={selected} onChange={setSelected} showAll />
        </section>

        <section>
          <h3 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '14px' }}>Compact (Icons Only)</h3>
          <SportTabsCompact selected={selected} onChange={setSelected} />
        </section>

        <section>
          <h3 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '14px' }}>Dropdown (Mobile)</h3>
          <SportDropdown selected={selected} onChange={setSelected} />
        </section>

        <p style={{ color: '#6b7280', fontSize: '12px' }}>
          All variants sync to the same selection: <span style={{ color: '#00D4FF' }}>{selected}</span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'All three sport selector variants. Click any to see synchronized selection.' },
    },
  },
};

// Responsive usage example
export const ResponsiveExample = {
  render: () => {
    const [selected, setSelected] = useState('NBA');
    return (
      <div>
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>
            Desktop / Tablet (≥768px)
          </p>
          <SportTabs selected={selected} onChange={setSelected} />
        </div>

        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '320px'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>
            Mobile (&lt;768px)
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <SportTabsCompact selected={selected} onChange={setSelected} />
            <span style={{ color: '#6b7280' }}>or</span>
            <SportDropdown selected={selected} onChange={setSelected} />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'Example of responsive usage: full tabs on desktop, compact or dropdown on mobile.' },
    },
  },
};
