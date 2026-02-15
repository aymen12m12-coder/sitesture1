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
      {/* Upper Bar: Language, Icons */}
      <div className="bg-gradient-to-r from-primary via-orange-500 to-primary text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <button className="hover:text-black transition-colors flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>YEMEN / AR</span>
            </button>
            <span className="hidden md:inline opacity-50">|</span>
            <span className="hidden md:inline">شحن مجاني للطلبات فوق 200 ريال</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setLocation(user ? '/profile' : '/auth')}
              className="flex items-center gap-2 hover:text-black transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user ? user.name : 'تسجيل الدخول / التسجيل'}</span>
            </button>
            
            <button 
              onClick={() => setLocation('/favorites')}
              className="flex items-center gap-2 hover:text-black transition-colors relative"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">المفضلة</span>
            </button>

            <button 
              onClick={() => setLocation('/cart')}
              className="flex items-center gap-2 hover:text-black transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-primary text-[9px] rounded-full h-4 w-4 flex items-center justify-center border border-primary font-black">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">الحقيبة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo, Search */}
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-8">
        {/* Left Side: Menu Icon (Mobile) */}
        <div className="flex items-center md:hidden">
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.getElementById('sidebar-trigger')?.click()}>
              <MenuIcon className="h-6 w-6" />
           </Button>
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto relative group">
          <Input 
            className="w-full pl-12 h-11 border-2 border-gray-100 rounded-none focus:border-primary focus-visible:ring-0 transition-all text-base"
            placeholder="ابحث عن الفواكه، الخضروات، أو أي منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </button>
        </form>

        {/* Logo (Right) */}
        <div 
          className="text-3xl md:text-4xl font-black tracking-tighter cursor-pointer shrink-0 text-primary transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
          onClick={() => setLocation('/')}
        >
          <span className="text-xs font-bold text-black uppercase tracking-widest opacity-50 hidden sm:inline">FRESH</span>
          طمطوم
        </div>

        {/* Mobile Search Trigger */}
        <div className="flex items-center md:hidden gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {isSearchOpen && (
        <div className="md:hidden bg-white px-4 pb-4 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSearch} className="relative">
            <Input 
              autoFocus
              className="w-full pl-10 h-10 border-2 border-primary rounded-none focus-visible:ring-0"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </form>
        </div>
      )}
    </div>
  );
};

export default TopBar;
