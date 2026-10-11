import { clsx, type ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-aiko-dark-200 bg-white shadow-sm',
        'dark:border-aiko-dark-700 dark:bg-aiko-dark-900',
        padded && 'p-5',
        className,
      )}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-aiko-dark-900 dark:text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-aiko-dark-500 dark:text-aiko-dark-400">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-aiko-green-500 text-white hover:bg-aiko-green-600 disabled:bg-aiko-green-300',
  outline:
    'border border-aiko-dark-300 text-aiko-dark-700 hover:bg-aiko-dark-50 dark:border-aiko-dark-600 dark:text-aiko-dark-200 dark:hover:bg-aiko-dark-800',
  ghost:
    'text-aiko-dark-600 hover:bg-aiko-dark-100 dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

export function Button({
  children,
  variant = 'primary',
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-70',
        BUTTON_VARIANTS[variant],
        className,
      )}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

const TONES: Record<Tone, string> = {
  green: 'bg-aiko-green-100 text-aiko-green-800 dark:bg-aiko-green-900/40 dark:text-aiko-green-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  neutral: 'bg-aiko-dark-100 text-aiko-dark-700 dark:bg-aiko-dark-800 dark:text-aiko-dark-300',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
      )}>
      {children}
    </span>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-aiko-dark-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-aiko-dark-400 focus:border-aiko-green-500 focus:outline-none focus:ring-1 focus:ring-aiko-green-500',
        'dark:border-aiko-dark-600 dark:bg-aiko-dark-800 dark:text-white',
        className,
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={cn(
        'rounded-lg border border-aiko-dark-300 bg-white px-3 py-2 text-sm',
        'focus:border-aiko-green-500 focus:outline-none focus:ring-1 focus:ring-aiko-green-500',
        'dark:border-aiko-dark-600 dark:bg-aiko-dark-800 dark:text-white',
        className,
      )}>
      {children}
    </select>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'border-b border-aiko-dark-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide',
        'text-aiko-dark-500 dark:border-aiko-dark-700 dark:text-aiko-dark-400',
        className,
      )}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        'border-b border-aiko-dark-100 px-4 py-3 align-middle',
        'text-aiko-dark-800 dark:border-aiko-dark-800 dark:text-aiko-dark-200',
        className,
      )}>
      {children}
    </td>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-aiko-dark-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label ?? 'Loading…'}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">{title}</p>
      {hint ? <p className="mt-1 text-sm text-aiko-dark-500">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-red-600">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-aiko-dark-900 dark:text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-aiko-dark-500 dark:text-aiko-dark-400">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
