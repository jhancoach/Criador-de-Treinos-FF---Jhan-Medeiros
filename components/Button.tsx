import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-display font-semibold tracking-wide rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-black hover:brightness-110 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]",
    secondary: "bg-panel border border-theme text-main hover:border-primary hover:text-primary",
    danger: "bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-800",
    ghost: "bg-transparent text-muted hover:text-main"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};