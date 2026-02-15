import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Filter, 
  LayoutGrid,
  Menu as ListMenu,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItemCard from '../components/MenuItemCard';
import type { MenuItem, Category, Restaurant } from '@shared/schema';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState('recommend');

  // Fetch all stores to get their names for cards
  const { data: stores } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  // Fetch products for this category
  const { data: allProducts, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/products', slug],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const products: MenuItem[] = await response.json();
      
      const targetCategory = decodeURIComponent(slug || '');

      // Filter by category name (case insensitive and exact match)
      return products.filter((item: MenuItem) => {
        if (!item.category) return false;
        const itemCat = item.category.trim().toLowerCase();
        const targetCat = targetCategory.trim().toLowerCase();
        
        return itemCat === targetCat || 
               itemCat.includes(targetCat) || 
               targetCat.includes(itemCat);
      });
    }
  });

  const sortedItems = [...(allProducts || [])].sort((a, b) => {
    if (sortBy === 'price-asc') return parseFloat(String(a.price)) - parseFloat(String(b.price));
    if (sortBy === 'price-desc') return parseFloat(String(b.price)) - parseFloat(String(a.price));
    return 0;
  });

  const getCategoryTitle = () => {
    return decodeURIComponent(slug || '');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs - Minimal */}
      <div className="container mx-auto px-4 py-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        <button onClick={() => setLocation('/')} className="hover:text-black transition-colors">HOME</button>
        <span>/</span>
        <span className="text-black">{slug}</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10">
            <div>
              <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b-2 border-black pb-2 uppercase tracking-wider">
                <Filter className="h-5 w-5" /> التصفية
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-sm mb-3">السعر</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="accent-black" /> أقل من 50 ريال
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="accent-black" /> 50 - 100 ريال
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="accent-black" /> أكثر من 100 ريال
                    </label>
                  </div>
                </div>
                
                <div>
                  <p className="font-bold text-sm mb-3">التصنيف</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">جاري تصفية المنتجات حسب القسم المحدد...</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Product Area */}
          <div className="flex-1">
            <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter italic border-r-8 border-primary pr-6">{getCategoryTitle()}</h1>

            {/* Sorting Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b pb-6">
              <div className="flex items-center gap-8 w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                {['recommend', 'newest', 'price-asc', 'price-desc'].map((sort) => (
                  <button 
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`text-sm font-black pb-2 border-b-2 transition-all uppercase tracking-tighter ${sortBy === sort ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                  >
                    {sort === 'recommend' ? 'التوصية' : 
                     sort === 'newest' ? 'الأحدث' : 
                     sort === 'price-asc' ? 'السعر: تصاعدي' : 'السعر: تنازلي'}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-sm font-bold text-gray-400 uppercase">{sortedItems.length} منتج</span>
                <div className="flex border-2 border-gray-100 rounded-none overflow-hidden">
                  <button className="p-2.5 bg-gray-50"><LayoutGrid className="h-4 w-4" /></button>
                  <button className="p-2.5 hover:bg-gray-50"><ListMenu className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {isLoading ? (
                Array(12).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-none" />
                    <div className="h-4 bg-gray-100 w-1/2" />
                    <div className="h-4 bg-gray-100 w-3/4" />
                  </div>
                ))
              ) : sortedItems.length > 0 ? (
                sortedItems.map((item) => {
                  const store = stores?.find(s => s.id === item.restaurantId);
                  return (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      restaurantId={item.restaurantId || ''}
                      restaurantName={store?.name || 'متجر'}
                    />
                  );
                })
              ) : (
                <div className="col-span-full py-32 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">لا توجد منتجات في هذا القسم</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
