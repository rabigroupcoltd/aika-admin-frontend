// import React from 'react';
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTransactionsQuery } from '../hooks/useApiQueries';
import { Table, LoadingSpinner, EmptyState, Card } from '../components/ui';

const Transactions = () => {
  const { data: transactions, isLoading, isError } = useTransactionsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message="Failed to load transactions" />;

  const headers = ['Ref', 'User', 'Type', 'Amount', 'Status', 'Date'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">History of all financial movements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ref..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-aiko-green-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table headers={headers}>
          {transactions?.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions?.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                  {tx.transactionRef}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{tx.user?.profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{tx.user?.email || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    {tx.type === 'CREDIT' ? (
                      <ArrowDownLeft className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 mr-1 text-red-500" />
                    )}
                    <span className={tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${tx.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
};

export default Transactions;
