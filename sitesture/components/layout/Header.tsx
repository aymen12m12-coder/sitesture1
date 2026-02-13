import Link from "next/link";
import { Search, ShoppingCart, User, MapPin } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-noon-yellow sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-bold italic">noon</span>
        </Link>

        {/* Delivery to */}
        <div className="hidden md:flex items-center text-xs gap-1 border-r border-black/10 pr-4">
          <MapPin size={16} />
          <div>
            <p className="text-black/60">التوصيل إلى</p>
            <p className="font-bold">الرياض</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="ما الذي تبحث عنه؟"
            className="w-full py-2 px-4 rounded bg-white focus:outline-none text-sm"
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={20} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 text-sm font-bold">
          <Link href="/login" className="flex items-center gap-1 border-l border-black/10 pl-6">
            <span>تسجيل الدخول</span>
            <User size={20} />
          </Link>
          <Link href="/cart" className="flex items-center gap-1">
            <span>العربة</span>
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Sub Header / Categories */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="container mx-auto px-4 py-2 flex gap-6 text-xs font-bold whitespace-nowrap">
          <Link href="/categories/electronics" className="text-blue-600 uppercase">الإلكترونيات</Link>
          <Link href="/categories/fashion" className="uppercase">الأزياء</Link>
          <Link href="/categories/home" className="uppercase">المنزل</Link>
          <Link href="/categories/beauty" className="uppercase">الجمال</Link>
          <Link href="/categories/baby" className="uppercase">الأطفال</Link>
          <Link href="/categories/grocery" className="uppercase">البقالة</Link>
        </div>
      </div>
    </header>
  );
}
