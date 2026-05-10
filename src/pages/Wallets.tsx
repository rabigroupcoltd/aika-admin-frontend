import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUsersQuery, useWalletQuery, useCreditWalletMutation, useDebitWalletMutation } from '../hooks/useApiQueries';
import { Card, LoadingSpinner, EmptyState, Button } from '../components/ui';
import type { User, WalletInfo, QueryParams } from '../types';

// ─── Wallet Modal ─────────────────────────────────────────────────────────────
interface WalletModalProps {
  user: User;
  onClose: () => void;
}

function WalletModal({ user, onClose }: WalletModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'credit' | 'debit'>('credit');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const { data: wallet, isLoading } = useWalletQuery(user.id);
  const creditMutation = useCreditWalletMutation(user.id);
  const debitMutation = useDebitWalletMutation(user.id);

  const activeMutation = mode === 'credit' ? creditMutation : debitMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setToast({ type: 'error', msg: 'Please enter a valid amount.' });
      return;
    }
    activeMutation.mutate(
      { amount: numAmount, note: note || undefined },
      {
        onSuccess: () => {
          setToast({ type: 'success', msg: `Wallet ${mode}ed successfully.` });
          setAmount('');
          setNote('');
        },
        onError: (err: any) => {
          setToast({ type: 'error', msg: err?.response?.data?.message || 'Operation failed.' });
        },
      },
    );
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(v ?? 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Wallet Management</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.profile?.name || user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance Card */}
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm font-bold uppercase tracking-wider opacity-80">Current Balance</span>
            </div>
            {isLoading ? (
              <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-black tracking-tight">
                {formatCurrency((wallet as WalletInfo)?.balance ?? 0)}
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-muted rounded-2xl border border-border">
            {(['credit', 'debit'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setToast(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  mode === m
                    ? m === 'credit'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-destructive text-destructive-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {m.charAt(0).toUpperCase() + m.slice(1)} Wallet
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2 ${
                toast.type === 'success'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              {toast.msg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 ml-1">
                Amount (₦)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                required
                className="w-full px-5 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 ml-1">
                Note <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-5 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={activeMutation.isPending}
              variant={mode === 'credit' ? 'primary' : 'outline'}
              className={`w-full h-14 rounded-2xl font-bold text-lg ${
                mode === 'debit' ? 'border-destructive text-destructive hover:bg-destructive/10' : ''
              }`}
            >
              {activeMutation.isPending
                ? 'Processing…'
                : mode === 'credit'
                ? 'Confirm Credit'
                : 'Confirm Debit'}
            </Button>
          </form>

          {/* Recent Transactions */}
          {!isLoading && (wallet as WalletInfo)?.transaction?.length ? (
            <div className="pt-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-1">
                Recent Transactions
              </h3>
              <ul className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {(wallet as WalletInfo).transaction!.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'CREDIT' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'CREDIT' ? (
                          <ArrowUpCircle className="w-5 h-5" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        tx.type === 'CREDIT' ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Wallets = () => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    size: 10,
    search: '',
  });

  const { data, isLoading, isError } = useUsersQuery(params);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) return <LoadingSpinner />;

  const users = data?.result || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Wallets
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage user balances and transaction history
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={params.search}
            onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            placeholder="Search users..."
            className="w-full md:w-80 pl-12 pr-5 py-3.5 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground shadow-sm"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            All Users <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{data?.totalItems || 0}</span>
          </h2>
        </div>

        {isError ? (
           <div className="p-20">
            <EmptyState message="Failed to load users. Please refresh the page." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-20">
            <EmptyState message="No users found matching your search" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                      <span className="text-primary font-black text-xl">
                        {(user.profile?.name || user.email)?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">
                        {user.profile?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedUser(user)}
                    variant="primary"
                    className="rounded-2xl px-6 py-3 font-bold flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Manage Wallet
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between p-6 border-t border-border">
                    <div className="text-sm font-medium text-muted-foreground">
                    Showing <span className="text-foreground font-bold">{(params.page! - 1) * params.size! + 1}</span> to <span className="text-foreground font-bold">{Math.min(params.page! * params.size!, data.totalItems)}</span> of <span className="text-foreground font-bold">{data.totalItems}</span> users
                    </div>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => setParams(prev => ({ ...prev, page: prev.page! - 1 }))}
                        disabled={params.page === 1}
                        className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => setParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                        disabled={params.page === totalPages}
                        className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                    </div>
                </div>
            )}
          </>
        )}
      </Card>

      {/* Wallet Modal */}
      {selectedUser && (
        <WalletModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default Wallets;
