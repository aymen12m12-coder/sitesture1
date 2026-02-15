import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import type { MenuItem } from '@shared/schema';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface MenuItemCardProps {
  item: MenuItem;
  disabled?: boolean;
  disabledMessage?: string;
  restaurantId?: string;
  restaurantName?: string;
}

export default function MenuItemCard({ 
  item, 
  disabled = false, 
  disabledMessage, 
  restaurantId = 'unknown', 
  restaurantName = 'متجر غير محدد' 
}: MenuItemCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Check if item is in favorites
  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: ['/api/favorites/check', user?.id, item.id],
    queryFn: async () => {
      if (!user?.id) return { isFavorite: false };
      const res = await fetch(`/api/favorites/check?userId=${user.id}&menuItemId=${item.id}`);
      if (!res.ok) return { isFavorite: false };
      return res.json();
    },
    enabled: !!user?.id,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        setLocation('/auth');
        return;
      }

      if (favoriteStatus?.isFavorite) {
        await apiRequest('DELETE', `/api/favorites?userId=${user?.id}&menuItemId=${item.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', {
          userId: user?.id,
          menuItemId: item.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', user?.id, item.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/products', user?.id] });
      
      toast({
        title: favoriteStatus?.isFavorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة",
        description: favoriteStatus?.isFavorite ? `تمت إزالة ${item.name} من قائمة مفضلاتك` : `تم إضافة ${item.name} إلى قائمة مفضلاتك`,
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (disabled && disabledMessage) {
      toast({
        title: "لا يمكن الطلب",
        description: disabledMessage,
        variant: "destructive",
      });
      return;
    }
    
    addItem(item, restaurantId, restaurantName);
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${item.name} للسلة`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate();
  };

  const discountPercent = item.originalPrice 
    ? Math.round((1 - parseFloat(String(item.price)) / parseFloat(String(item.originalPrice))) * 100)
    : 0;

  const colors = item.colors ? item.colors.split(',') : [];

  return (
    <div className="group relative bg-white cursor-pointer" onClick={() => setLocation(`/product/${item.id}`)}>
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {item.isFeatured && (
            <Badge className="bg-black text-white rounded-none text-[10px] py-0 font-bold">
              #1 الأكثر مبيعاً
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge className="bg-red-600 text-white rounded-none text-[10px] py-0 font-bold">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button 
            className="w-full rounded-none bg-white/90 text-black hover:bg-black hover:text-white border-none shadow-lg font-bold flex gap-2"
            onClick={handleAddToCart}
            disabled={!item.isAvailable || disabled}
          >
            <ShoppingBag className="h-4 w-4" />
            إضافة سريعة
          </Button>
        </div>

        {/* Favorite Icon */}
        <button 
          className="absolute top-2 left-2 p-1.5 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
        >
          <Heart className={`h-4 w-4 ${favoriteStatus?.isFavorite ? 'text-red-600 fill-current' : 'text-gray-700'}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="py-3 px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.brand || 'طمطوم'}</span>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] text-gray-600 font-bold">{item.rating || '4.8'}</span>
          </div>
        </div>
        
        <h4 className="text-sm text-gray-800 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h4>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-black text-black">{item.price} ريال</span>
          {item.originalPrice && (
            <span className="text-sm text-gray-400 line-through">{item.originalPrice} ريال</span>
          )}
        </div>

        {/* Sales Proof */}
        {item.salesCount !== undefined && (
          <p className="text-[10px] text-gray-500 mb-2 font-bold">
            تم بيع {item.salesCount}+ قطعة
          </p>
        )}

        {/* Color Options - Hidden for food products if empty */}
        {colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {colors.slice(0, 4).map((color, idx) => (
              <div 
                key={idx} 
                className="w-3.5 h-3.5 rounded-full border border-gray-200" 
                style={{ backgroundColor: color.trim().toLowerCase() }}
              />
            ))}
            {colors.length > 4 && <span className="text-[10px] text-gray-400">+{colors.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
