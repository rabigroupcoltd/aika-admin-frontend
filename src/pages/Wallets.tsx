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
} from 'lucide-react';
import { useUsersQuery, useWalletQuery, useCreditWalletMutation, useDebitWalletMutation } from '../hooks/useApiQueries';
import { Card, LoadingSpinner, EmptyState } from '../components/ui';
import type { User, WalletInfo } from '../types';

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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wallet Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.profile?.name || user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-aiko-green-500 to-aiko-green-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-1">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Current Balance</span>
            </div>
            {isLoading ? (
              <div className="h-8 w-32 bg-white bg-opacity-20 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency((wallet as WalletInfo)?.balance ?? 0)}
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
            {(['credit', 'debit'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setToast(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? m === 'credit'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
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
              className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                toast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {toast.msg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aiko-green-500 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Note <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aiko-green-500 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={activeMutation.isPending}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
                mode === 'credit'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {activeMutation.isPending
                ? 'Processing…'
                : mode === 'credit'
                ? 'Credit Wallet'
                : 'Debit Wallet'}
            </button>
          </form>

          {/* Recent Transactions */}
          {!isLoading && (wallet as WalletInfo)?.transaction?.length ? (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Recent Transactions
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(wallet as WalletInfo).transaction!.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {tx.type === 'CREDIT' ? (
                        <ArrowUpCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'
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
  const { data: users = [], isLoading, isError } = useUsersQuery();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message="Failed to load users" />;

  const filtered = users.filter((u: User) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.profile?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Wallet Management
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Credit or debit user wallets directly from the admin panel
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({filtered.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-aiko-green-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filtered.map((user: User) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-aiko-green-100 dark:bg-aiko-green-900/30 flex items-center justify-center">
                    <span className="text-aiko-green-600 dark:text-aiko-green-400 font-bold text-sm">
                      {(user.profile?.name || user.email)?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {user.profile?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-2 px-4 py-2 bg-aiko-green-500 hover:bg-aiko-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Wallet</span>
                </button>
              </div>
            ))}
          </div>
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
