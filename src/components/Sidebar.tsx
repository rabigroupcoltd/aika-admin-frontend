import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart3, CheckCircle, CreditCard, Wallet, Package, Bike, History } from 'lucide-react';
import { AikaLogo } from './AikaLogo';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/app', icon: BarChart3, label: 'Dashboard' },
    { path: '/app/users', icon: Users, label: 'Users' },
    { path: '/app/riders', icon: Bike, label: 'Riders' },
    { path: '/app/orders', icon: Package, label: 'Orders' },
    { path: '/app/transactions', icon: History, label: 'Transactions' },
    { path: '/app/kyc', icon: CheckCircle, label: 'KYC Approvals' },
    { path: '/app/payouts', icon: CreditCard, label: 'Payouts' },
    { path: '/app/wallets', icon: Wallet, label: 'Wallets' },
  ];


  return (
    <div className="bg-background w-64 shadow-lg border-r border-border flex flex-col transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <AikaLogo className="w-40" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">Aiko Admin Portal v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;