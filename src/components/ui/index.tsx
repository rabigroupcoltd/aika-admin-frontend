import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-aiko-dark-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-aiko-dark-700 ${className}`}>
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-aiko-dark-900 dark:text-white mt-2">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-aiko-green-100 dark:bg-aiko-green-900 rounded-lg text-aiko-green-600 dark:text-aiko-green-300">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-aiko-green-500 hover:bg-aiko-green-600 text-white dark:bg-aiko-green-600 dark:hover:bg-aiko-green-700',
    secondary: 'bg-aiko-dark-500 hover:bg-aiko-dark-600 text-white dark:bg-aiko-dark-600 dark:hover:bg-aiko-dark-700',
    outline: 'border-2 border-aiko-green-500 text-aiko-green-500 hover:bg-aiko-green-50 dark:border-aiko-green-400 dark:text-aiko-green-400 dark:hover:bg-aiko-dark-900',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-aiko-green-500 to-aiko-dark-500 rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-white dark:bg-aiko-dark-800 rounded-full"></div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-aiko-dark-700 border-b border-gray-200 dark:border-aiko-dark-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-aiko-dark-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};
