import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, ReceiptText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionsQuery } from '../hooks/useApiQueries';
import { Table, LoadingSpinner, EmptyState, Card } from '../components/ui';
import type { QueryParams, Transaction } from '../types';

const Transactions = () => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    size: 10,
    search: '',
  });

  const { data, isLoading, isError } = useTransactionsQuery(params);

  if (isLoading) return <LoadingSpinner />;

  const transactions = data?.result || [];
  const totalPages = data?.totalPages || 1;

  const headers = ['Ref', 'User', 'Type', 'Amount', 'Status', 'Date'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1 font-medium">History of all financial movements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search ref..."
              value={params.search}
              onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <Table headers={headers}>
          {isError ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-destructive font-medium">
                Failed to load transactions. Please refresh.
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-muted-foreground font-medium">
                No transactions recorded yet
              </td>
            </tr>
          ) : (
            transactions.map((tx: Transaction) => (
              <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                    <div className="p-2 bg-muted rounded-lg mr-3">
                        <ReceiptText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">{tx.transactionRef}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-foreground">{tx.user?.profile?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground font-medium">{tx.user?.email || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {tx.type === 'CREDIT' ? (
                      <ArrowDownLeft className="w-4 h-4 mr-1 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 mr-1 text-destructive" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${tx.type === 'CREDIT' ? 'text-primary' : 'text-destructive'}`}>
                      {tx.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-foreground">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${tx.status === 'SUCCESSFUL' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                  {new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
              </tr>
            ))
          )}
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-border">
                <div className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-foreground font-bold">{(params.page! - 1) * params.size! + 1}</span> to <span className="text-foreground font-bold">{Math.min(params.page! * params.size!, data.totalItems)}</span> of <span className="text-foreground font-bold">{data.totalItems}</span> transactions
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

export default Transactions;
