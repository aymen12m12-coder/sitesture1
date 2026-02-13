import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Image as ImageIcon,
  Tag
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
    { icon: Package, label: "المنتجات", href: "/admin/products" },
    { icon: Tag, label: "الفئات", href: "/admin/categories" },
    { icon: ShoppingCart, label: "الطلبات", href: "/admin/orders" },
    { icon: Users, label: "العملاء", href: "/admin/customers" },
    { icon: BarChart3, label: "التقارير", href: "/admin/reports" },
    { icon: ImageIcon, label: "الوسائط", href: "/admin/media" },
    { icon: Settings, label: "الإعدادات", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-noon-blue text-white p-6 hidden lg:block">
        <div className="mb-10">
          <span className="text-2xl font-bold italic text-noon-yellow">noon</span>
          <span className="text-xs ml-2 text-white/60">Admin</span>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8">
          <h2 className="font-bold text-lg text-gray-800">لوحة التحكم</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">مدير النظام</span>
            <div className="w-8 h-8 rounded-full bg-noon-yellow flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
