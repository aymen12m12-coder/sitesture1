import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Star, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Flashlight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import type { Restaurant, Category, SpecialOffer, MenuItem } from '@shared/schema';

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  // Fetch data
  const { data: stores } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: offers } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers'],
  });

  const { data: featuredProducts } = useQuery<MenuItem[]>({
    queryKey: ['/api/products/featured'],
    queryFn: async () => {
      const response = await fetch('/api/restaurants'); // Fallback for now
      const stores = await response.json();
      if (stores.length > 0) {
        const productsRes = await fetch(`/api/restaurants/${stores[0].id}/menu`);
        return productsRes.json();
      }
      return [];
    }
  });

  const activeOffers = offers?.filter(offer => offer.isActive) || [];

  const nextOffer = () => {
    if (activeOffers.length > 1) {
      setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length);
    }
  };

  const prevOffer = () => {
    if (activeOffers.length > 1) {
      setCurrentOfferIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section (Banner) */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gray-100">
        {activeOffers.length > 0 ? (
          <div className="h-full relative">
            <div 
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${currentOfferIndex * 100}%)` }}
            >
              {activeOffers.map((offer) => (
                <div key={offer.id} className="w-full h-full flex-shrink-0 relative">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white p-4">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">{offer.title}</h2>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">{offer.description}</p>
                    <Button 
                      size="lg" 
                      className="rounded-none px-12 bg-white text-black hover:bg-black hover:text-white transition-all text-xl font-bold"
                      onClick={() => setLocation(`/category/sale`)}
                    >
                      تسوق الآن
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {activeOffers.length > 1 && (
              <>
                <button 
                  onClick={prevOffer}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button 
                  onClick={nextOffer}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-black text-gray-800 mb-4">أزياء عالمية بين يديك</h2>
              <p className="text-xl text-gray-600 mb-8">اكتشف أحدث الصيحات لهذا الموسم</p>
              <Button size="lg" className="rounded-none px-12 text-xl font-bold">ابدأ التسوق</Button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Circular Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-center gap-4 md:gap-12 overflow-x-auto pb-4 scrollbar-hide">
          {categories?.map((category) => (
            <div 
              key={category.id} 
              className="flex flex-col items-center gap-3 cursor-pointer group shrink-0"
              onClick={() => setLocation(`/category/${category.id}`)}
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-black transition-all">
                {category.icon ? (
                  <span className="text-3xl"><i className={category.icon}></i></span>
                ) : (
                  <ShoppingBag className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <span className="text-sm md:text-base font-bold text-gray-800">{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale / Featured Products */}
      <section className="container mx-auto px-4 py-8 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-black">الأكثر مبيعاً</h2>
          </div>
          <Button variant="link" className="text-gray-600 font-bold" onClick={() => setLocation('/category/best-sellers')}>
            عرض الكل <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredProducts?.slice(0, 6).map((product) => (
            <MenuItemCard 
              key={product.id} 
              item={product} 
              restaurantId={product.restaurantId || ''} 
              restaurantName="متجر"
            />
          ))}
        </div>
      </section>

      {/* 4. Quick Style Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[300px] group overflow-hidden cursor-pointer" onClick={() => setLocation('/category/women')}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
              <h3 className="text-4xl font-black mb-2 italic">الرقي والأناقة</h3>
              <p className="text-xl border-b-2 border-white pb-1">تشكيلة النساء</p>
            </div>
          </div>
          <div className="relative h-[300px] group overflow-hidden cursor-pointer" onClick={() => setLocation('/category/men')}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
              <h3 className="text-4xl font-black mb-2 italic">إطلالة واثقة</h3>
              <p className="text-xl border-b-2 border-white pb-1">تشكيلة الرجال</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending Stores (Matajer) */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <div className="flex items-center gap-3 mb-8">
          <Award className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-black">أشهر المتاجر</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stores?.slice(0, 3).map((store) => (
            <div 
              key={store.id} 
              className="group border border-gray-100 rounded-none overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setLocation(`/restaurant/${store.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 text-xs font-bold shadow-lg">
                  توصيل: {store.deliveryTime}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-400 px-2 py-0.5 rounded text-sm font-bold">
                    <Star className="h-3 w-3 fill-current" /> {store.rating}
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{store.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">استكشف المتجر</span>
                  <ChevronLeft className="h-5 w-5 text-primary group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}