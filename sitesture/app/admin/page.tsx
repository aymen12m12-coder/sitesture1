import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "إجمالي المبيعات", value: "SAR 125,430", icon: DollarSign, color: "bg-green-500", trend: "+12.5%", isUp: true },
    { label: "إجمالي الطلبات", value: "1,240", icon: ShoppingCart, color: "bg-blue-500", trend: "+5.2%", isUp: true },
    { label: "إجمالي المنتجات", value: "850", icon: Package, color: "bg-purple-500", trend: "0%", isUp: true },
    { label: "إجمالي العملاء", value: "4,500", icon: Users, color: "bg-orange-500", trend: "-2.1%", isUp: false },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-6">آخر الطلبات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b text-gray-400 text-sm">
                  <th className="pb-4 font-medium">رقم الطلب</th>
                  <th className="pb-4 font-medium">العميل</th>
                  <th className="pb-4 font-medium">المبلغ</th>
                  <th className="pb-4 font-medium">الحالة</th>
                  <th className="pb-4 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-4 font-bold">#ORD-902{i}</td>
                    <td className="py-4">أحمد محمد</td>
                    <td className="py-4 font-medium text-blue-600">SAR 1,299</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">تم التوصيل</span>
                    </td>
                    <td className="py-4 text-gray-500">منذ ساعتين</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-6">الأكثر مبيعاً</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold line-clamp-1">iPhone 16 Pro Max</p>
                  <p className="text-xs text-gray-400">120 مبيعة</p>
                </div>
                <div className="text-sm font-bold">SAR 5,699</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
