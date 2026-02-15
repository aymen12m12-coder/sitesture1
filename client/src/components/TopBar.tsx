import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Globe, 
  ShoppingCart, 
  Heart, 
  User, 
  Search,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const TopBar: React.FC = () => {
  const [, setLocation] = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      {/* Desktop & Tablet Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Utilities (Account, Favorites, Cart) */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setLocation(user ? '/profile' : '/auth')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative group"
            title="الحساب"
          >
            <User className="h-6 w-6 text-gray-700" />
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">حسابي</span>
          </button>
          
          <button 
            onClick={() => setLocation('/favorites')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative group"
            title="المفضلة"
          >
            <Heart className="h-6 w-6 text-gray-700" />
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">المفضلة</span>
          </button>

          <button 
            onClick={() => setLocation('/cart')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative group"
            title="الحقيبة"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
                  {getItemCount()}
                </span>
              )}
            </div>
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">الحقيبة</span>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <Input 
              className="w-full pr-10 pl-4 h-11 bg-gray-100 border-none rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-base"
              placeholder="ما الذي تبحث عنه اليوم؟"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Right Side: Logo & Menu */}
        <div className="flex items-center gap-4">
          <div 
            className="cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <div className="logo-tamtom text-3xl md:text-4xl">
              <span className="green">طم</span>
              <span className="red">طوم</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => document.getElementById('sidebar-trigger')?.click()}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar (Sticky below header on mobile) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input 
            className="w-full pr-10 pl-4 h-10 bg-gray-100 border-none rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            placeholder="ابحث عن منتجات، أقسام، أو عروض..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopBar;
