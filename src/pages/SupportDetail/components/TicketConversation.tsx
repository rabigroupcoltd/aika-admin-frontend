import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, CardHeader, cn } from '@/components/ui';
import { dateTime } from '@/lib/format';
import type { SupportMessage } from '@/modules/support/type';

interface TicketConversationProps {
  messages: SupportMessage[];
  sending: boolean;
  onSend: (body: string, internal: boolean) => Promise<void>;
}

export function TicketConversation({ messages, sending, onSend }: TicketConversationProps) {
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);

  async function handleSend() {
    try {
      await onSend(body.trim(), internal);
      setBody('');
      setInternal(false);
    } catch {
    }
  }

  return (
    <Card>
      <CardHeader title="Conversation" />
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="mt-4 border-t border-aiko-dark-100 pt-4 dark:border-aiko-dark-800">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder={internal ? 'A note only staff will see…' : 'Reply to the customer…'}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-aiko-green-500',
            internal
              ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
              : 'border-aiko-dark-300 bg-white dark:border-aiko-dark-600 dark:bg-aiko-dark-800 dark:text-white',
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
            <input
              type="checkbox"
              checked={internal}
              onChange={(event) => setInternal(event.target.checked)}
              className="h-4 w-4 rounded border-aiko-dark-300 accent-amber-500"
            />
            Internal note — the customer never sees this
          </label>
          <Button loading={sending} disabled={!body.trim()} onClick={() => void handleSend()}>
            {internal ? 'Add note' : 'Send reply'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MessageBubble({ message }: { message: SupportMessage }) {
  return (
    <div
      className={cn(
        'rounded-lg p-3',
        message.internal
          ? 'border border-dashed border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
          : message.fromStaff
            ? 'bg-aiko-green-50 dark:bg-aiko-green-900/20'
            : 'bg-aiko-dark-50 dark:bg-aiko-dark-800',
      )}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium text-aiko-dark-900 dark:text-white">
          {message.sender?.name ?? (message.fromStaff ? 'Support' : 'Customer')}
        </span>
        {message.internal ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Lock className="h-3 w-3" />
            Internal note
          </span>
        ) : null}
        <span className="ml-auto text-xs text-aiko-dark-500">{dateTime(message.createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
        {message.body}
      </p>
    </div>
  );
}
