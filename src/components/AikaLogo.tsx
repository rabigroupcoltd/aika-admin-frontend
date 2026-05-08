import React from 'react';

interface AikoLogoProps {
  className?: string;
  compact?: boolean;
}

export const AikoLogo: React.FC<AikoLogoProps> = ({ className = 'w-32', compact = false }) => {
  if (compact) {
    return (
      <div className={className}>
        <img
          src="/aiko-icon.png"
          alt="Aiko Logo"
          className="w-full h-auto"
        />
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center space-x-3`}>
      {/* Logo Image */}
      <div className="w-12 h-12 flex-shrink-0">
        <img
          src="/aiko-icon.png"
          alt="Aiko"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-aiko-dark-500 dark:text-white">Aiko</span>
        <span className="text-xs text-aiko-green-500 font-semibold">Delivery</span>
      </div>
    </div>
  );
};

// Export with original name for backward compatibility
export { AikoLogo as AikaLogo };
