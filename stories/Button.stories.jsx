import React from 'react';

// Example button component for Storybook demo
const Button = ({ primary, backgroundColor, size, label, ...props }) => {
  const mode = primary
    ? { backgroundColor: '#10B981', color: 'white' }
    : { backgroundColor: '#1a1a2e', color: '#9CA3AF', border: '1px solid #333' };
  
  const sizeStyles = {
    small: { fontSize: '12px', padding: '8px 16px' },
    medium: { fontSize: '14px', padding: '10px 20px' },
    large: { fontSize: '16px', padding: '12px 24px' },
  };

  return (
    <button
      type="button"
      style={{
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        ...sizeStyles[size],
        ...mode,
        backgroundColor: backgroundColor || mode.backgroundColor,
      }}
      {...props}
    >
      {label}
    </button>
  );
};

export default {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

export const Primary = {
  args: {
    primary: true,
    label: 'Place Bet',
    size: 'medium',
  },
};

export const Secondary = {
  args: {
    label: 'View Details',
    size: 'medium',
  },
};

export const Large = {
  args: {
    primary: true,
    size: 'large',
    label: 'SMASH Pick',
  },
};

export const Small = {
  args: {
    size: 'small',
    label: 'Filter',
  },
};
