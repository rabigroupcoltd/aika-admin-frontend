import { Button, Card, CardHeader } from '@/components/ui';

interface KycApprovalCardProps {
  loading: boolean;
  onApprove: () => Promise<unknown>;
}

export function KycApprovalCard({ loading, onApprove }: KycApprovalCardProps) {
  return (
    <Card>
      <CardHeader title="Approve KYC" subtitle="Lets this driver go online." />
      <Button className="w-full" loading={loading} onClick={() => void onApprove()}>
        Approve
      </Button>
    </Card>
  );
}
