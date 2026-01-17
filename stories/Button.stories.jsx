import React from 'react';

const buttonStyles = {
  base: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  primary: {
    backgroundColor: '#00ff88',
    color: '#0a0a0f',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: '#00ff88',
    border: '2px solid #00ff88',
  },
  danger: {
    backgroundColor: '#ff4444',
    color: '#ffffff',
  },
  small: {
    padding: '8px 16px',
    fontSize: '12px',
  },
  large: {
    padding: '16px 32px',
    fontSize: '16px',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick
}) => {
  const style = {
    ...buttonStyles.base,
    ...buttonStyles[variant],
    ...(size === 'small' ? buttonStyles.small : {}),
    ...(size === 'large' ? buttonStyles.large : {}),
    ...(disabled ? buttonStyles.disabled : {}),
  };

  return (
    <button style={style} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onClick: { action: 'clicked' },
  },
};

export const Primary = {
  args: {
    children: 'Place Bet',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    children: 'View Details',
    variant: 'secondary',
  },
};

export const Danger = {
  args: {
    children: 'Cancel Bet',
    variant: 'danger',
  },
};

export const Small = {
  args: {
    children: 'Add',
    variant: 'primary',
    size: 'small',
  },
};

export const Large = {
  args: {
    children: 'Submit Parlay',
    variant: 'primary',
    size: 'large',
  },
};

export const Disabled = {
  args: {
    children: 'Unavailable',
    variant: 'primary',
    disabled: true,
  },
};
