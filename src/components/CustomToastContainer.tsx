import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/components/ui';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

let nextId = 1;
let toasts: Toast[] = [];
const listeners = new Set<(next: Toast[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function push(tone: Tone, message: string) {
  if (!message) return;

  const id = nextId++;
  toasts = [...toasts, { id, tone, message }];
  emit();

  window.setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3500);
}

const showToast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
};

export default showToast;

const TONES: Record<Tone, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className:
      'border-aiko-green-200 bg-aiko-green-50 text-aiko-green-800 dark:border-aiko-green-800 dark:bg-aiko-green-900/40 dark:text-aiko-green-100',
  },
  error: {
    icon: XCircle,
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100',
  },
  info: {
    icon: Info,
    className:
      'border-aiko-dark-200 bg-white text-aiko-dark-800 dark:border-aiko-dark-700 dark:bg-aiko-dark-800 dark:text-aiko-dark-100',
  },
};

export function CustomToastContainer() {
  const [current, setCurrent] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.add(setCurrent);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  if (!current.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {current.map((toast) => {
        const { icon: Icon, className } = TONES[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg',
              className,
            )}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
