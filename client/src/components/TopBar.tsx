import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  ShoppingCart, 
  Heart, 
  User, 
  Search,
  Menu as MenuIcon,
  X,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const TopBar: React.FC = () => {
  const [, setLocation] = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
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

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    toast({
      title: newLang === 'ar' ? 'تم تغيير اللغة' : 'Language Changed',
      description: newLang === 'ar' ? 'التطبيق الآن باللغة العربية' : 'App is now in English',
    });
  };

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      {/* Desktop & Tablet Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo - Right side in RTL */}
        <div 
          className="cursor-pointer shrink-0"
          onClick={() => setLocation('/')}
        >
          <div className="logo-tamtom text-4xl md:text-6xl flex items-center font-black tracking-tighter italic leading-none">
            <span className="text-[#388e3c]">طم</span>
            <span className="text-[#d32f2f]">طوم</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <Input 
              className="w-full pr-12 pl-4 h-12 bg-gray-100 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl transition-all text-base font-bold"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors`}>
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Utilities: Language, Account, Favorites, Cart */}
        <div className="flex items-center gap-1 md:gap-5">
          {/* Language Toggle - Desktop only to save space */}
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group hidden md:flex items-center gap-1"
            title={t('language_country')}
          >
            <Globe className="h-6 w-6 text-gray-700" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button 
            onClick={() => setLocation(user ? '/profile' : '/auth')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
            title={t('account')}
          >
            <User className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>
          
          <button 
            onClick={() => setLocation('/favorites')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
            title={t('favorites')}
          >
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>

          <button 
            onClick={() => setLocation('/cart')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
            title={t('cart')}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d32f2f] text-white text-[8px] md:text-[10px] rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold border-2 border-white">
                  {getItemCount()}
                </span>
              )}
            </div>
          </button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9" 
            onClick={() => document.getElementById('sidebar-trigger')?.click()}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar (Sticky below header on mobile) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input 
            className="w-full pr-10 pl-4 h-11 bg-gray-100 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`}>
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopBar;
