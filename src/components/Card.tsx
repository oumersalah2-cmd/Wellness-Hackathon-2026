import React from 'react'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-white/10 p-6 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <h2 className={clsx('text-xl font-serif font-bold mb-4', className)}>{children}</h2>
  )
}

export function CardBody({ children, className }: CardProps) {
  return <div className={clsx('', className)}>{children}</div>
}
