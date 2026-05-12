import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  as?: React.ElementType;
  className?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function Button({
  as: Component = 'button',
  className = '',
  fullWidth = false,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <Component
      className={`btn btn-${variant}${fullWidth ? ' btn-full' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
