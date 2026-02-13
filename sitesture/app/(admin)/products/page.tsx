import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { getProducts } from "@/lib/actions";

export default async function ProductsAdminPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المنتجات</h2>
        <button className="bg-noon-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors">
          <Plus size={20} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث عن منتج بالاسم أو الرقم التسلسلي..."
            className="w-full pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            <span>تصفية</span>
          </button>
          <select className="px-4 py-2 border rounded-lg bg-white focus:outline-none">
            <option>جميع الفئات</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">المنتج</th>
              <th className="px-6 py-4 font-medium">الفئة</th>
              <th className="px-6 py-4 font-medium">السعر</th>
              <th className="px-6 py-4 font-medium">المخزون</th>
              <th className="px-6 py-4 font-medium">الحالة</th>
              <th className="px-6 py-4 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">لا توجد منتجات حالياً</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        {product.images[0] ? <img src={product.images[0]} alt="" className="object-cover w-full h-full" /> : <Package size={20} className="text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs text-gray-400">#{product.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category?.name || "بدون فئة"}</td>
                  <td className="px-6 py-4 font-bold">SAR {product.price.toString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{product.stock} قطعة</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? 'نشط' : 'نفذت'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded text-blue-600"><Edit size={18} /></button>
                      <button className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Package } from "lucide-react";
