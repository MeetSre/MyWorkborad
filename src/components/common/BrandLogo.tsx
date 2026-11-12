import React from 'react';
import { Tenant } from '../../types';
import { Layers, GraduationCap, School, Truck, Sparkles, Building2 } from 'lucide-react';

interface BrandLogoProps {
  tenant: Tenant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  tenant,
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  };

  const renderIcon = () => {
    if (tenant.logoUrl) {
      return (
        <img
          src={tenant.logoUrl}
          alt={tenant.name}
          className="w-full h-full object-contain rounded-lg"
        />
      );
    }

    const iconSize = iconSizes[size];

    switch (tenant.logoPreset) {
      case 'academic':
        return <GraduationCap size={iconSize} className="text-white" />;
      case 'school':
        return <School size={iconSize} className="text-white" />;
      case 'logistics':
        return <Truck size={iconSize} className="text-white" />;
      case 'tech':
        return <Layers size={iconSize} className="text-white" />;
      default:
        return tenant.industry === 'college' ? (
          <GraduationCap size={iconSize} className="text-white" />
        ) : tenant.industry === 'school' ? (
          <School size={iconSize} className="text-white" />
        ) : tenant.industry === 'enterprise' ? (
          <Building2 size={iconSize} className="text-white" />
        ) : (
          <Sparkles size={iconSize} className="text-white" />
        );
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 transition-transform hover:scale-105 overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.accentColor || tenant.primaryColor})`,
        }}
      >
        {renderIcon()}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 tracking-tight truncate text-sm sm:text-base leading-tight">
              {tenant.name}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border uppercase"
              style={{
                borderColor: `${tenant.primaryColor}55`,
                color: tenant.primaryColor,
                backgroundColor: `${tenant.primaryColor}15`,
              }}
            >
              {tenant.ticketPrefix}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
            {tenant.domain}
          </span>
        </div>
      )}
    </div>
  );
};
