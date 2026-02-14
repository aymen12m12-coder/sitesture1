import React from 'react';
import { useLocation } from 'wouter';
import { 
  Globe, 
  ShoppingCart, 
  Heart, 
  User, 
  Search,
  Menu as MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';

export const TopBar: React.FC = () => {
  const [, setLocation] = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      {/* Upper Bar: Language, Icons */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <button className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>YEMEN / AR</span>
            </button>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline">شحن مجاني للطلبات فوق 200 ريال</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLocation(user ? '/profile' : '/auth')}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <User className="h-4 w-4" />
              <span>{user ? user.name : 'تسجيل الدخول / التسجيل'}</span>
            </button>
            
            <button 
              onClick={() => setLocation('/favorites')}
              className="flex items-center gap-2 hover:text-primary transition-colors relative"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">المفضلة</span>
            </button>

            <button 
              onClick={() => setLocation('/cart')}
              className="flex items-center gap-2 hover:text-primary transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center border border-black font-black">
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
      <div className="container mx-auto px-4 py-4 flex items-center gap-8">
        {/* Logo */}
        <div 
          className="text-4xl font-black tracking-tighter cursor-pointer shrink-0 text-primary transition-transform hover:scale-105 active:scale-95"
          onClick={() => setLocation('/')}
        >
          طمطوم <span className="text-xs font-bold text-black uppercase tracking-widest opacity-50">FASHION</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto relative group">
          <Input 
            className="w-full pl-12 h-12 border-2 border-gray-100 rounded-none focus:border-black focus-visible:ring-0 transition-all text-lg"
            placeholder="ما الذي تبحثين عنه اليوم؟"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-black transition-colors" />
        </div>

        {/* Support/Other (Optional) */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="outline" className="rounded-none border-black h-12 px-8 font-black hover:bg-black hover:text-white transition-all uppercase tracking-widest">
            التطبيق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
