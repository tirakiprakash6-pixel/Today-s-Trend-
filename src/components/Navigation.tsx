import React from 'react';
import { Home, Grid, PackageCheck, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ActiveTab } from '../types';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, orders, likedProductIds } = useShop();
  const activeOrdersCount = orders.filter((order) => order.status !== 'cancelled').length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'categories',
      label: 'Collections',
      icon: Grid,
    },
    {
      id: 'liked',
      label: 'Wishlist',
      icon: Heart,
      badge: likedProductIds.length > 0 ? likedProductIds.length : undefined,
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: PackageCheck,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden py-2 px-3 shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-0.5 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 font-medium hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900 stroke-[2.2]' : 'text-slate-400'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-slate-900 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
