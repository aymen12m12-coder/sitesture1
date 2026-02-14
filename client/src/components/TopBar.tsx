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
      <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-1 text-gray-600">
            <Globe className="h-4 w-4" />
            <span>العربية / اليمن</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLocation('/profile')}
            className="flex items-center gap-1 text-gray-700 hover:text-black"
          >
            <User className="h-5 w-5" />
            <span>{user ? user.name : 'تسجيل الدخول / التسجيل'}</span>
          </button>
          
          <button 
            onClick={() => setLocation('/favorites')}
            className="flex items-center gap-1 text-gray-700 hover:text-black relative"
          >
            <Heart className="h-5 w-5" />
            <span className="hidden md:inline">المفضلة</span>
          </button>

          <button 
            onClick={() => setLocation('/cart')}
            className="flex items-center gap-1 text-gray-700 hover:text-black relative"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </div>
            <span className="hidden md:inline">السلة</span>
          </button>
        </div>
      </div>

      {/* Main Bar: Logo, Search */}
      <div className="container mx-auto px-4 py-4 flex items-center gap-8">
        {/* Logo */}
        <div 
          className="text-3xl font-black tracking-tighter cursor-pointer shrink-0"
          onClick={() => setLocation('/')}
        >
          SHEIN <span className="text-xs font-normal">Clone</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto relative group">
          <Input 
            className="w-full pl-10 h-10 border-2 border-black rounded-none focus-visible:ring-0"
            placeholder="البحث عن المنتجات، الفساتين، الخ..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
        </div>

        {/* Support/Other (Optional) */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="outline" className="rounded-none border-black hover:bg-black hover:text-white transition-colors">
            تطبيق الجوال
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
