import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#38BDF8] text-[#080B12] font-semibold hover:bg-[#60CAFA] active:bg-[#0EA5E9] border border-transparent',
  secondary:
    'bg-[#161F2E] text-[#F8FAFC] font-medium border border-[#263244] hover:border-[#38BDF8]/60 hover:bg-[#1B2638] active:bg-[#111827]',
  ghost:
    'bg-transparent text-[#94A3B8] font-medium border border-transparent hover:text-[#F8FAFC] hover:bg-[#161F2E]/70',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-4 py-2 text-xs',
  md: 'min-h-[42px] px-5 py-2.5 text-sm',
  lg: 'min-h-[46px] px-6 py-3 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg whitespace-nowrap shrink-0',
    'transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]',
    'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ');

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? 'button'}
      disabled={buttonProps.disabled || isLoading}
      className={classes}
      {...buttonProps}
    >
      {isLoading ? (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
