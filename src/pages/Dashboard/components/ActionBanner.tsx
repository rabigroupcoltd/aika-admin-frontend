import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/components/ui';

interface ActionBannerProps {
  to: string;
  text: string;
  tone: 'amber' | 'red';
}

export function ActionBanner({ to, text, tone }: ActionBannerProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        tone === 'red'
          ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200'
          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200',
      )}>
      <AlertTriangle className="h-4 w-4" />
      {text}
      <span aria-hidden>→</span>
    </Link>
  );
}
