import { useState } from 'react';
import { Bike, Search, Filter, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRidersQuery } from '../hooks/useApiQueries';
import { Table, LoadingSpinner, Card } from '../components/ui';
import type { QueryParams, Rider } from '../types';

const Riders = () => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    size: 10,
    search: '',
  });

  const { data, isLoading, isError } = useRidersQuery(params);

  if (isLoading) return <LoadingSpinner />;

  const riders = data?.result || [];
  const totalPages = data?.totalPages || 1;

  const headers = ['Rider', 'Contact', 'Vehicle', 'Status', 'KYC', 'Joined'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-primary';
      case 'SUSPENDED': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Riders</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage delivery personnel and verification status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search riders..."
              value={params.search}
              onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <Table headers={headers}>
          {isError ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-destructive font-medium">
                Failed to load riders. Please refresh.
              </td>
            </tr>
          ) : riders.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-muted-foreground font-medium">
                No riders found in the system
              </td>
            </tr>
          ) : (
            riders.map((rider: Rider) => (
              <tr key={rider.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mr-4 border border-primary/20">
                      <Bike className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{rider.profile?.name || 'Unnamed Rider'}</div>
                      <div className="text-xs text-muted-foreground font-medium">{rider.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground/80">
                  {rider.profile?.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-foreground">{rider.vehicle?.type || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground font-medium">{rider.vehicle?.plateNumber || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`flex items-center text-xs font-black uppercase tracking-widest ${getStatusColor(rider.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${rider.status === 'ACTIVE' ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
                    {rider.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rider.driverStatus === 'APPROVED' ? (
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-medium">
                  Recent
                </td>
              </tr>
            ))
          )}
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div className="text-sm font-medium text-muted-foreground">
              Showing <span className="text-foreground font-bold">{(params.page! - 1) * params.size! + 1}</span> to <span className="text-foreground font-bold">{Math.min(params.page! * params.size!, data.totalItems)}</span> of <span className="text-foreground font-bold">{data.totalItems}</span> riders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: prev.page! - 1 }))}
                disabled={params.page === 1}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                disabled={params.page === totalPages}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Riders;
