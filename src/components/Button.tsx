import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-emerald-500 text-white hover:shadow-lg hover:shadow-primary/30 shadow-md',
    secondary: 'bg-gradient-to-r from-accent to-yellow-500 text-white hover:shadow-lg hover:shadow-accent/30 shadow-md',
    outline:
      'border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 dark:border-primary/30 dark:text-primary dark:hover:bg-primary/10',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
