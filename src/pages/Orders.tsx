import { useState } from 'react';
import { Package, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrdersQuery } from '../hooks/useApiQueries';
import { Table, LoadingSpinner, EmptyState, Card } from '../components/ui';
import type { QueryParams, Order } from '../types';

const Orders = () => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    size: 10,
    search: '',
  });

  const { data, isLoading, isError } = useOrdersQuery(params);

  if (isLoading) return <LoadingSpinner />;

  const orders = data?.result || [];
  const totalPages = data?.totalPages || 1;

  const headers = ['Order #', 'Customer', 'Rider', 'Status', 'Amount', 'Date'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-primary/10 text-primary border-primary/20';
      case 'CANCELLED': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search orders..."
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
                Failed to load orders. Please refresh.
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-muted-foreground font-medium">
                No orders found in the system
              </td>
            </tr>
          ) : (
            orders.map((order: Order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-bold text-foreground">{order.orderNumber}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground/80">
                  {order.customer?.profile?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground/80">
                  {order.rider?.profile?.name || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-foreground">
                  ₦{order.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-medium">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
              </tr>
            ))
          )}
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-border">
                <div className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-foreground font-bold">{(params.page! - 1) * params.size! + 1}</span> to <span className="text-foreground font-bold">{Math.min(params.page! * params.size!, data.totalItems)}</span> of <span className="text-foreground font-bold">{data.totalItems}</span> orders
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

export default Orders;
