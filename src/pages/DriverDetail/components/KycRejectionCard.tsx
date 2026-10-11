import { useState } from 'react';
import { Button, Card, CardHeader, Input } from '@/components/ui';

interface KycRejectionCardProps {
  loading: boolean;
  onReject: (reason: string) => Promise<unknown>;
}

export function KycRejectionCard({ loading, onReject }: KycRejectionCardProps) {
  const [reason, setReason] = useState('');

  async function handleReject() {
    try {
      await onReject(reason.trim());
      setReason('');
    } catch {
    }
  }

  return (
    <Card>
      <CardHeader
        title="Reject KYC"
        subtitle="Sends the driver back to re-shoot their documents. The reason is shown to them."
      />
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="What was wrong?"
      />
      <Button
        variant="danger"
        className="mt-3 w-full"
        loading={loading}
        disabled={reason.trim().length < 3}
        onClick={() => void handleReject()}>
        Reject
      </Button>
    </Card>
  );
}
