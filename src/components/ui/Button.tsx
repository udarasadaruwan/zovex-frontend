import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  as?: React.ElementType;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function Button({
  as: Component = 'button',
  children,
  className = '',
  fullWidth = false,
  loading = false,
  loadingText,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isNativeButton = Component === 'button';
  const isDisabled = Boolean(props.disabled || loading);

  return (
    <Component
      className={`btn btn-${variant}${fullWidth ? ' btn-full' : ''}${loading ? ' is-loading' : ''}${className ? ` ${className}` : ''}`}
      {...props}
      disabled={isNativeButton ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={!isNativeButton && isDisabled ? true : undefined}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </Component>
  );
}
