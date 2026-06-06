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
        'bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6',
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
