import type { KycStatus } from '@/modules/drivers/type';
import type { OrderStatus } from '@/modules/orders/type';
import type { SupportPriority, SupportStatus } from '@/modules/support/type';

export function money(amount: number | null | undefined, currency = 'NGN'): string {
  if (amount == null) return '—';
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-NG')}`;
}

export function shortDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function dateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relative(value: string | Date | null | undefined): string {
  if (!value) return '—';

  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function duration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

export function orderTone(status: OrderStatus): Tone {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return 'green';
    case 'CANCELLED':
    case 'NO_DRIVER_FOUND':
      return 'red';
    case 'SEARCHING_FOR_DRIVER':
    case 'PENDING':
      return 'amber';
    default:
      return 'blue';
  }
}

export function humanise(value: string): string {
  const spaced = value.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function kycTone(status: KycStatus): Tone {
  if (status === 'APPROVED') return 'green';
  if (status === 'REJECTED') return 'red';
  return 'amber';
}

export function supportTone(status: SupportStatus): Tone {
  if (status === 'RESOLVED') return 'green';
  if (status === 'CLOSED') return 'neutral';
  if (status === 'PENDING') return 'blue';
  return 'amber';
}

export function priorityTone(priority: SupportPriority): Tone {
  if (priority === 'URGENT') return 'red';
  if (priority === 'HIGH') return 'amber';
  if (priority === 'LOW') return 'neutral';
  return 'blue';
}
