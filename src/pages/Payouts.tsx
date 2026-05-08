import { AlertCircle, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { useProcessPayoutsMutation } from '../hooks/useApiQueries';
import { Card, Button } from '../components/ui';

const Payouts = () => {
  const payoutMutation = useProcessPayoutsMutation();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-aiko-dark-900 dark:text-white">Process Payouts</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Calculate and distribute payments to approved drivers
        </p>
      </div>

      {/* Info Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <Card className="p-4 md:p-6 border-l-4 border-l-aiko-green-500">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-aiko-green-100 dark:bg-aiko-green-900 rounded-lg">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-aiko-green-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-aiko-dark-900 dark:text-white">
                Pending Payouts
              </h3>
              <p className="text-xl md:text-2xl font-bold text-aiko-green-600 dark:text-aiko-green-400 mt-1">
                0
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-l-4 border-l-green-500">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-aiko-dark-900 dark:text-white">
                Processed
              </h3>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-l-4 border-l-aiko-green-500 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-aiko-dark-900 dark:text-white">
                Failed
              </h3>
              <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Action Card */}
      <Card className="p-4 md:p-8">
        <div className="max-w-2xl">
          {/* Warning Alert */}
          <div className="flex items-start space-x-3 md:space-x-4 mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm md:text-base">
                Important Notice
              </h3>
              <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                This action will calculate net balances and initiate payouts for all approved drivers. This process
                cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 dark:bg-aiko-dark-800 rounded-lg">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Amount to Process
                </label>
                <p className="text-xl md:text-2xl font-bold text-aiko-dark-900 dark:text-white mt-2">
                  ₦0.00
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of Drivers
                </label>
                <p className="text-xl md:text-2xl font-bold text-aiko-dark-900 dark:text-white mt-2">0</p>
              </div>
            </div>

            {/* Error Alert */}
            {payoutMutation.isError && (
              <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-xs md:text-sm font-medium">
                  Error processing payouts. Please try again.
                </p>
              </div>
            )}

            {/* Success Alert */}
            {payoutMutation.isSuccess && (
              <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-xs md:text-sm font-medium">
                  Payouts processed successfully!
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending}
              variant="primary"
              size="lg"
              className="w-full text-sm md:text-base"
            >
              {payoutMutation.isPending ? 'Processing Payouts...' : 'Process Payouts'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Payouts;