import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, ArrowRight, Heart as HeartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItemCard from '../components/MenuItemCard';
import type { MenuItem, Restaurant } from '@shared/schema';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

// Define types for better type safety
interface FavoriteProduct extends MenuItem {
  restaurantName?: string;
}

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stores/restaurants
  const { data: stores, isLoading: storesLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch favorite products
  const fetchFavorites = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/favorites/products/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch favorite products: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add restaurant name to each favorite
      const favoritesWithStoreNames = data.map((item: MenuItem) => ({
        ...item,
        restaurantName: stores?.find(s => s.id === item.restaurantId)?.name || 'متجر'
      }));
      
      setFavorites(favoritesWithStoreNames);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Show error toast or handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id, stores]);

  // Handle loading state
  if (isLoading || storesLoading) {
    return (
      <div className="bg-white min-h-screen pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-48 bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-white">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <HeartIcon className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-3 text-gray-900">
          {language === 'ar' ? 'سجل دخولك للمفضلة' : 'Login to Favorites'}
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm text-lg">
          {language === 'ar' 
            ? 'احفظ منتجاتك المفضلة وارجع لها بسهولة في أي وقت' 
            : 'Save your favorite products and access them anytime'}
        </p>
        <Button 
          onClick={() => setLocation('/auth')} 
          className="w-full max-w-xs font-bold rounded-full h-14 text-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')} 
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          {language === 'ar' ? 'متابعة كزائر' : 'Continue as guest'}
        </Button>
      </div>
    );
  }

  // Empty favorites state
  if (!favorites || favorites.length === 0) {
    return (
      <div className="bg-white min-h-screen pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic border-r-4 border-red-500 pr-4">
              {language === 'ar' ? 'المفضلة' : 'Favorites'}
            </h1>
            <span className="text-sm font-bold text-gray-400 uppercase">
              0 {language === 'ar' ? 'منتجات' : 'items'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <HeartIcon className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-gray-900">
              {language === 'ar' ? 'قائمة المفضلة فارغة' : 'Favorites list is empty'}
            </h3>
            <p className="text-gray-500 mb-10 max-w-md text-lg">
              {language === 'ar' 
                ? 'لم تقم بإضافة أي منتج إلى المفضلة بعد. ابدأ بالبحث وأضف منتجاتك المفضلة' 
                : "You haven't added any products to favorites yet. Start exploring and add your favorites"}
            </p>
            <Button 
              onClick={() => setLocation('/')} 
              className="flex items-center gap-3 font-bold rounded-full h-14 px-10 text-lg bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main favorites view
  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-red-200">
              <HeartIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
              {language === 'ar' ? 'المفضلة' : 'Favorites'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400 uppercase">
              {favorites.length} {language === 'ar' ? 'منتج' : 'items'}
            </span>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {favorites.map((item) => (
            <div key={item.id} className="group relative">
              <MenuItemCard 
                item={item} 
                restaurantId={item.restaurantId || ''}
                restaurantName={item.restaurantName || 'متجر'}
              />
              {/* Remove from favorites button */}
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/favorites/remove/${item.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ userId: user?.id }),
                    });
                    
                    if (response.ok) {
                      setFavorites(prev => prev.filter(fav => fav.id !== item.id));
                    }
                  } catch (error) {
                    console.error('Error removing from favorites:', error);
                  }
                }}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg hover:bg-red-500 hover:text-white"
                aria-label="Remove from favorites"
              >
                <HeartIcon className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>

        {/* Browse more button */}
        <div className="text-center mt-16">
          <Button 
            onClick={() => setLocation('/')} 
            variant="outline"
            className="flex items-center gap-2 mx-auto font-bold rounded-full h-12 px-8 border-2 hover:bg-gray-50 transition-all duration-300"
          >
            {language === 'ar' ? 'اكتشف المزيد من المنتجات' : 'Discover more products'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
