import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-500 focus-visible:ring-teal",
    secondary: "border-2 border-primary text-charcoal hover:bg-primary/5 focus-visible:ring-primary",
    outline: "border border-muted/30 text-muted hover:text-charcoal hover:border-primary",
    ghost: "text-muted hover:bg-primary/5 hover:text-charcoal",
    travel: "bg-coral text-white hover:bg-coral-500 focus-visible:ring-coral",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 py-2",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
