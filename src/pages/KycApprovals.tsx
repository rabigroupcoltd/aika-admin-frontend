import { CheckCircle, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { usePendingKycQuery, useApproveDriverMutation } from '../hooks/useApiQueries';
import { Card, Button, LoadingSpinner, EmptyState } from '../components/ui';
import type { User } from '../types';

const KycApprovals = () => {
  const { data: users = [], isLoading, isError } = usePendingKycQuery();
  const approveMutation = useApproveDriverMutation();

  if (isLoading) return <LoadingSpinner />;

  if (isError || !users) {
    return <EmptyState message="Failed to load KYC requests" />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-aiko-dark-900 dark:text-white">KYC Approvals</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Review and approve driver KYC documents
        </p>
      </div>

      {users.length === 0 ? (
        <Card className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-aiko-dark-900 dark:text-white">All Caught Up!</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">No pending KYC approvals at this moment.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {users.map((user: User) => (
            <Card key={user.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {/* User Info */}
                <div className="col-span-1">
                  <h3 className="text-base md:text-lg font-semibold text-aiko-dark-900 dark:text-white">
                    {user.profile?.name || 'Unknown'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {user.email}
                  </p>
                  <div className="mt-3 md:mt-4">
                    <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
                      <AlertCircle className="inline w-3 h-3 mr-1" />
                      Pending Review
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="col-span-1">
                  <h4 className="text-sm font-semibold text-aiko-dark-900 dark:text-white mb-2 md:mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-aiko-green-500" />
                    Documents
                  </h4>
                  <div className="space-y-1 md:space-y-2">
{user.kycDocuments?.length ? (
                       user.kycDocuments.map((doc: { type: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-aiko-green-500 hover:text-aiko-green-600 dark:hover:text-aiko-green-400 text-xs md:text-sm font-medium break-all"
                        >
                          {doc.type}
                          <ExternalLink className="w-3 h-3 ml-2 flex-shrink-0" />
                        </a>
                      ))
                    ) : (
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-end col-span-1 md:col-span-1">
                  <Button
                    onClick={() =>
                      approveMutation.mutate({ userId: user.id, deviceToken: 'admin_approval' })
                    }
                    disabled={approveMutation.isPending}
                    className="w-full text-xs md:text-base py-2 md:py-3"
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve Driver'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KycApprovals;