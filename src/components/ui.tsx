import React from 'react';

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer rounded-lg';
  
  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-[0_2px_6px_rgba(37,99,235,0.3),0_1px_2px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] active:translate-y-px',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 shadow-[0_2px_6px_rgba(15,23,42,0.15)] hover:shadow-md active:translate-y-px',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] active:bg-slate-100 active:translate-y-px',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-[0_2px_6px_rgba(225,29,72,0.25)] hover:shadow-[0_4px_10px_rgba(225,29,72,0.3)] active:translate-y-px',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200/60'
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Card with refined realistic depth and subtle border contrast
export const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({
  children,
  className = '',
  id
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-xl border border-slate-200/85 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08),0_1px_4px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.11),0_3px_6px_-2px_rgba(15,23,42,0.05)] transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

// Form Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_1px_3px_rgba(15,23,42,0.06)] transition-all ${
          error ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/20' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
};

// Form Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_1px_3px_rgba(15,23,42,0.06)] transition-all cursor-pointer ${
          error ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

// Clean unboxed metadata badges (adheres to zero-pill rules for clean typography)
export const StatusIndicator: React.FC<{
  status: 'complete' | 'partial' | 'scheduled' | 'conflict' | 'blocked' | 'available' | 'occupied';
  label?: string;
}> = ({ status, label }) => {
  const configs = {
    complete: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Complete' },
    partial: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Partial Allocation' },
    scheduled: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Scheduled' },
    conflict: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Conflict' },
    blocked: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'Blocked' },
    available: { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'Available' },
    occupied: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Occupied' }
  };

  const item = configs[status] || configs.scheduled;
  const displayLabel = label || item.text;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${item.bg}`}>
      {displayLabel}
    </span>
  );
};
