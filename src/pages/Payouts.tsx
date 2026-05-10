import { AlertCircle, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { useProcessPayoutsMutation, usePayoutSummaryQuery } from '../hooks/useApiQueries';
import { Card, Button, LoadingSpinner } from '../components/ui';

const Payouts = () => {
  const { data: summary, isLoading: isSummaryLoading } = usePayoutSummaryQuery();
  const payoutMutation = useProcessPayoutsMutation();

  if (isSummaryLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Process Payouts</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
          Calculate and distribute payments to approved drivers
        </p>
      </div>

      {/* Info Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-6 border-l-4 border-l-primary bg-card/50 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Pending Payouts
              </h3>
              <p className="text-2xl md:text-3xl font-black text-foreground mt-1">
                {summary?.pendingPayouts || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary bg-card/50 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Processed Today
              </h3>
              <p className="text-2xl md:text-3xl font-black text-foreground mt-1">
                {summary?.processedCount || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive bg-card/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-destructive/10 rounded-2xl text-destructive border border-destructive/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Failed
              </h3>
              <p className="text-2xl md:text-3xl font-black text-foreground mt-1">
                {summary?.failedCount || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Action Card */}
      <Card className="p-6 md:p-10 border-none shadow-2xl bg-card/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto">
          {/* Warning Alert */}
          <div className="flex items-start space-x-4 mb-8 p-5 bg-yellow-500/10 rounded-3xl border border-yellow-500/20">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-bold text-yellow-500 text-base md:text-lg">
                Important Notice
              </h3>
              <p className="text-sm text-yellow-500/80 mt-1 font-medium leading-relaxed">
                This action will calculate net balances and initiate payouts for all approved drivers. This process
                cannot be undone and involves real financial transfers.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-muted/50 rounded-3xl border border-border">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total Amount
                </label>
                <p className="text-2xl md:text-3xl font-black text-foreground">
                  ₦{(summary?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Eligible Drivers
                </label>
                <p className="text-2xl md:text-3xl font-black text-foreground">
                  {summary?.pendingPayouts || 0}
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {payoutMutation.isError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake-1">
                <p className="text-destructive text-sm font-bold">
                  Error: {payoutMutation.error?.message || 'Transaction failed. Please try again.'}
                </p>
              </div>
            )}

            {/* Success Alert */}
            {payoutMutation.isSuccess && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl animate-in zoom-in-95">
                <p className="text-primary text-sm font-bold">
                  Payouts completed! {payoutMutation.data?.processedCount} drivers successfully paid.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending || !summary?.pendingPayouts}
              variant="primary"
              size="lg"
              className="w-full h-16 rounded-3xl text-xl font-black shadow-xl shadow-primary/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {payoutMutation.isPending ? (
                <span className="flex items-center">
                  <LoadingSpinner /> Processing Transfers...
                </span>
              ) : (
                'Execute Batch Payout'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Payouts;