import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/actions";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="h-48 md:h-[400px] w-full bg-gray-200 rounded-lg overflow-hidden relative">
             <div className="absolute inset-0 flex items-center justify-center bg-noon-yellow/20">
                <h2 className="text-3xl font-bold text-center">عروض الجمعة البيضاء وصلت!</h2>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <h3 className="text-xl font-bold mb-4">تسوق حسب الفئات</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {["الإلكترونيات", "الأزياء", "المنزل", "الجمال", "الأطفال", "البقالة", "الرياضة", "الألعاب"].map((cat) => (
            <div key={cat} className="bg-white p-4 rounded text-center cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-full aspect-square bg-gray-100 rounded-full mb-2"></div>
              <span className="text-xs font-bold">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Deals of the day */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">أفضل العروض</h3>
            <button className="border border-black px-4 py-1 rounded text-sm font-bold">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400">
                قريباً... أفضل العروض ستظهر هنا
              </div>
            ) : (
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  discount={product.discount ? Number(product.discount) : undefined}
                  image={product.images[0] || ""}
                  rating={4.5} // Default rating for now
                  reviewsCount={10} // Default count for now
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="container mx-auto px-4">
        <h3 className="text-xl font-bold mb-4">أشهر الماركات</h3>
        <div className="flex flex-wrap gap-4 justify-center">
           {["Apple", "Samsung", "Sony", "Nike", "Adidas", "Philips"].map(brand => (
             <div key={brand} className="bg-white px-8 py-4 rounded border flex items-center justify-center font-bold text-gray-400 italic">
               {brand}
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
