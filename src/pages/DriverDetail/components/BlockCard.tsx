import { Button, Card, CardHeader } from '@/components/ui';

interface BlockCardProps {
  isBlocked: boolean;
  loading: boolean;
  onToggle: () => Promise<unknown>;
}

export function BlockCard({ isBlocked, loading, onToggle }: BlockCardProps) {
  return (
    <Card>
      <CardHeader
        title={isBlocked ? 'Unblock' : 'Block'}
        subtitle={
          isBlocked
            ? 'Lets them accept work again.'
            : 'Takes them out of the dispatch pool immediately.'
        }
      />
      <Button
        variant={isBlocked ? 'primary' : 'danger'}
        className="w-full"
        loading={loading}
        onClick={() => void onToggle()}>
        {isBlocked ? 'Unblock driver' : 'Block driver'}
      </Button>
    </Card>
  );
}
