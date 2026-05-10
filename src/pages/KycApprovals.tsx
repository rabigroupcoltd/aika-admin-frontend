import { CheckCircle, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { usePendingKycQuery, useApproveDriverMutation } from '../hooks/useApiQueries';
import { Card, Button, LoadingSpinner, EmptyState } from '../components/ui';
import type { User } from '../types';

const KycApprovals = () => {
  const { data, isLoading, isError } = usePendingKycQuery();
  const approveMutation = useApproveDriverMutation();

  if (isLoading) return <LoadingSpinner />;

  const users = data?.result || [];

  if (isError) {
    return <EmptyState message="Failed to load KYC requests" />;
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">KYC Approvals</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
          Review and approve driver identification and vehicle documents
        </p>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 md:p-20 bg-card/50 backdrop-blur-sm border-dashed border-2">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">All Caught Up!</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">No pending KYC approvals at this moment. Everything is up to date.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {users.map((user: User) => (
            <Card key={user.id} className="p-6 md:p-8 hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm border-border group">
              <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-center">
                {/* User Info */}
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <span className="text-primary font-black text-lg">
                            {(user.profile?.name || user.email)?.[0]?.toUpperCase() ?? '?'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {user.profile?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">
                            {user.email}
                        </p>
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-black uppercase tracking-widest rounded-2xl border border-yellow-500/20">
                    <AlertCircle className="w-3.5 h-3.5 mr-2 animate-pulse" />
                    Awaiting Review
                  </div>
                </div>

                {/* Documents */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-primary" />
                    Verification Assets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.kycDocuments?.length ? (
                      user.kycDocuments.map((doc: { type: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group/doc"
                        >
                          <span className="text-xs font-bold text-foreground/80 truncate pr-2">{doc.type}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/doc:text-primary" />
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic font-medium">No documents uploaded yet</p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="md:col-span-3">
                  <Button
                    onClick={() =>
                      approveMutation.mutate({ userId: user.id, deviceToken: 'admin_approval' })
                    }
                    disabled={approveMutation.isPending}
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    {approveMutation.isPending ? (
                         <span className="flex items-center">
                            <LoadingSpinner /> Validating...
                        </span>
                    ) : 'Approve Rider'}
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